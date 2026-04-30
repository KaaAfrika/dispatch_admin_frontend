# Admin Action Endpoints

The endpoints below were added to give ops deeper control over pricing, deliveries, dispatchers, users, and an audit trail. All require `Authorization: Bearer <token>`.

Base URL:

```
https://<your-domain>/api/v1/admin
```

All responses use the standard envelope documented in `DISPATCH_ADMIN_API.md`:

```json
{ "status": true | false, "message": "...", "data": { } | [ ] | null }
```

---

## Pricing Settings (tunable)

Delivery pricing is no longer hardcoded — every tunable lives in the `settings` table under `type=pricing`. Admins read/write these with the existing settings endpoints (`GET/PUT /settings/{key}`, `POST /settings/update-multiple`, `GET /settings/group/pricing`). The new quote will read whichever values are persisted. Payload overrides (`base_fare`, `price_per_km`, etc.) on the quote endpoint still win when present.

| Key | Default | Meaning |
|-----|---------|---------|
| `delivery_base_fare` | `1300` | Flat base fare in currency units |
| `delivery_price_per_km` | `200` | Per-km rate |
| `delivery_weight_free_kg` | `15` | Weight (kg) included before surcharge kicks in |
| `delivery_weight_surcharge_per_kg` | `50` | Extra charge per kg over the free threshold |
| `delivery_platform_fee_rate` | `0.15` | Platform commission rate (0–1) |

Category surcharge now comes from `delivery_categories.surcharge` (rate, 0–1) — no more string-matching against category name.

### Get Pricing Group

```
GET /settings/group/pricing
```

**Response `200`:**
```json
{
  "status": true,
  "message": "Settings fetched successfully",
  "data": [
    { "key": "delivery_base_fare", "value": "1300", "type": "pricing" },
    { "key": "delivery_price_per_km", "value": "200", "type": "pricing" },
    { "key": "delivery_weight_free_kg", "value": "15", "type": "pricing" },
    { "key": "delivery_weight_surcharge_per_kg", "value": "50", "type": "pricing" },
    { "key": "delivery_platform_fee_rate", "value": "0.15", "type": "pricing" }
  ]
}
```

### Update a Pricing Key

```
PUT /settings/delivery_base_fare
```

**Request body:**
```json
{ "value": "2000" }
```

---

## Delivery Category Management

CRUD over `delivery_categories` — the source of truth for category surcharge rates used in pricing.

### List Categories

```
GET /delivery-categories
```

**Query params:** `per_page` (default 25), `is_active` (`0` | `1`), `search`

**Response `200`:** paginated list of categories.

### Create Category

```
POST /delivery-categories
```

**Request body:**
```json
{
  "name": "Fragile Items",
  "description": "Breakable goods requiring careful handling",
  "surcharge": 0.15,
  "max_weight_kg": 20,
  "is_active": true
}
```

> `surcharge` is a **rate between 0 and 1** (e.g. `0.15` = 15%).

### Get Category

```
GET /delivery-categories/{id}
```

### Update Category

```
PUT /delivery-categories/{id}
```

Body fields are all optional — same shape as create.

### Delete Category

```
DELETE /delivery-categories/{id}
```

**Error `400`** if the category is referenced by any delivery:
```json
{ "status": false, "message": "Category is in use and cannot be deleted", "data": null }
```

### Toggle Category Active State

```
POST /delivery-categories/{id}/toggle-status
```

---

## Delivery Vehicle Type Management

CRUD over `delivery_vehicles` (bike, van, etc.) — referenced by dispatchers during onboarding.

### List Vehicle Types

```
GET /delivery-vehicles
```

**Query params:** `per_page`, `is_active`, `search`

### Create Vehicle Type

```
POST /delivery-vehicles
```

**Request body:**
```json
{
  "code": "bike",
  "type": "two_wheeler",
  "vehicle": "Motorbike",
  "description": "Small packages, fast within city",
  "max_weight_kg": 20,
  "image_url": "https://...",
  "is_active": true
}
```

> `code` must be unique.

### Get / Update / Delete / Toggle

```
GET    /delivery-vehicles/{id}
PUT    /delivery-vehicles/{id}
DELETE /delivery-vehicles/{id}
POST   /delivery-vehicles/{id}/toggle-status
```

**Error `400` on delete** if any dispatcher references this vehicle type.

---

## Dispatcher — Deeper Admin Actions

### Update Dispatcher

```
PUT /dispatchers/{id}
```

Edit dispatcher profile, vehicle info, and service radius.

**Request body** (all fields optional):
```json
{
  "name": "John Doe",
  "phone_number": "08012345678",
  "state": "Lagos",
  "city": "Ikeja",
  "vehicle_id": 3,
  "vehicle_make": "Toyota",
  "vehicle_model": "Corolla",
  "vehicle_year": "2019",
  "vehicle_color": "Black",
  "license_plate": "LAG-001-AA",
  "preferred_radius_km": 12
}
```

**Response `200`:** updated dispatcher object.

### Reverse Wallet Transaction

```
POST /dispatchers/{id}/wallet/reverse/{transactionId}
```

Creates an inverse transaction that cancels a prior credit/debit. A `credit` of 1000 is reversed by a `debit` of 1000 (and vice versa). The original row is flagged in `metadata.reversed_by` for audit.

**Request body** (optional):
```json
{ "reason": "Posted to wrong dispatcher" }
```

**Response `200`:**
```json
{
  "status": true,
  "message": "Wallet transaction reversed successfully",
  "data": {
    "original_transaction_id": 101,
    "reversal_transaction_id": 205,
    "wallet_balance": "3500.00"
  }
}
```

**Error `400`** if the transaction was already reversed or does not belong to this dispatcher.

---

## Delivery — Deeper Admin Actions

### Override Delivery Fare

```
PATCH /deliveries/{id}/fare
```

Manually override pricing on an existing delivery. The override (before/after values, admin id, reason) is appended to `deliveries.metadata.fare_overrides[]` for audit.

**Request body:**
```json
{
  "base_fare": 2000,
  "total_amount": 3000,
  "payout_amount": 2400,
  "reason": "Customer dispute — pickup was further than advertised"
}
```

> `reason` is **required**. At least one of `base_fare`, `total_amount`, `payout_amount` must be present.

**Response `200`:**
```json
{
  "status": true,
  "message": "Delivery fare overridden successfully",
  "data": { /* updated delivery */ }
}
```

### Force Complete Delivery

```
POST /deliveries/{id}/force-complete
```

Admin marks a delivery as `delivered` out-of-band — for cases where the driver app failed or went offline. Sets `status=delivered`, `delivered_at=now()`, appends a `delivery_tracking_steps` row, and records `admin_id` + `reason` in `metadata`.

**Request body:**
```json
{ "reason": "Driver app offline — confirmed by phone with recipient" }
```

**Response `200`:** updated delivery.

**Error `400`** if the delivery is already `delivered` or `cancelled`.

### Refund Delivery (wallet-only)

```
POST /deliveries/{id}/refund
```

Issues a wallet refund to the customer for a paid delivery. Full or partial. Does **not** call the payment gateway — card/cash refunds are handled out-of-band by ops.

**Request body:**
```json
{
  "amount": 2500,
  "reason": "Package arrived damaged"
}
```

> `amount` is optional. If omitted, the full `total_amount` is refunded. `reason` is required.

**What happens:**
1. Customer's wallet is credited with `amount` via `WalletService::credit`.
2. A `wallet_transactions` row is written with `reference=REFUND_<tracking_code>`.
3. `delivery.payment_status` becomes `refunded` (new allowed value).
4. Refund details (amount, reason, admin id, timestamp) are appended to `metadata.refunds[]`.

**Response `200`:**
```json
{
  "status": true,
  "message": "Delivery refunded successfully",
  "data": {
    "delivery": { "id": 55, "payment_status": "refunded" },
    "refund_amount": 2500,
    "wallet_transaction_id": 412,
    "new_wallet_balance": "5000.00"
  }
}
```

**Error `400`** if:
- Delivery is not `payment_status=paid`.
- Requested `amount` exceeds `total_amount`.
- Customer has no wallet (shouldn't happen in practice).

### List Delivery Issues

```
GET /deliveries/{id}/issues
```

**Response `200`:**
```json
{
  "status": true,
  "message": "Delivery issues fetched successfully",
  "data": [
    {
      "id": 17,
      "delivery_id": 55,
      "reported_by": 99,
      "type": "damaged_package",
      "description": "Box arrived crushed",
      "status": "open",
      "resolution_notes": null,
      "resolved_at": null,
      "resolved_by": null,
      "created_at": "2026-03-14T19:00:00.000000Z"
    }
  ]
}
```

### Resolve Delivery Issue

```
POST /deliveries/{id}/issues/{issueId}/resolve
```

**Request body:**
```json
{ "resolution_notes": "Refunded customer, flagged dispatcher for training" }
```

**Response `200`:**
```json
{
  "status": true,
  "message": "Issue resolved successfully",
  "data": {
    "id": 17,
    "status": "resolved",
    "resolution_notes": "Refunded customer, flagged dispatcher for training",
    "resolved_at": "2026-04-20T11:00:00.000000Z",
    "resolved_by": 1
  }
}
```

**Error `404`** if the issue does not belong to the specified delivery.

---

## User — Suspend / Unsuspend / Reset Password

Parity with dispatcher moderation, applied at the `users` level. The login flow checks `suspended_at` and blocks sign-in for suspended users, returning 403 with the stored reason.

### Suspend User

```
POST /users/{id}/suspend
```

**Request body:**
```json
{ "reason": "Verified fraud report — investigation #4821" }
```

> `reason` is required (min 3 chars). On suspend, all of the user's Sanctum tokens are revoked immediately.

**Response `200`:**
```json
{
  "status": true,
  "message": "User suspended successfully",
  "data": {
    "id": 42,
    "suspended_at": "2026-04-20T11:00:00.000000Z",
    "suspension_reason": "Verified fraud report — investigation #4821",
    "suspended_by": 1
  }
}
```

### Unsuspend User

```
POST /users/{id}/unsuspend
```

Clears `suspended_at`, `suspension_reason`, `suspended_by`.

**Response `200`:** updated user object.

### Reset User Password

```
POST /users/{id}/reset-password
```

Generates a random 10-char password, stores its hash, revokes all tokens, and sends the plain password to the user via Termii SMS. The plain password is **not** returned in the response.

**Response `200`:**
```json
{
  "status": true,
  "message": "User password reset successfully",
  "data": {
    "user_id": 42,
    "notified_via_sms": true
  }
}
```

> If SMS delivery fails, the reset still succeeds; the failure is logged server-side.

---

## Broadcast Notifications

### Send to All Users (extended scope)

```
POST /notifications/send-to-all-users
```

Now supports `user_type=dispatchers` in addition to the previous scopes.

**Request body:**
```json
{
  "title": "Scheduled downtime tonight",
  "message": "Service will be offline 23:00–23:30 for maintenance.",
  "type": "general",
  "user_type": "dispatchers"
}
```

> `user_type` values: `all` | `riders` | `drivers` | `dispatchers`.

**Response `200`:**
```json
{
  "status": true,
  "message": "Notifications sent successfully",
  "data": { "sent_count": 68 }
}
```

---

## Audit Trail — Activity Logs

Every mutation on deliveries, dispatchers, users, wallets, delivery categories/vehicles, and settings is now written to an activity log (via `spatie/laravel-activitylog`). Each entry captures the admin (causer), the subject, and a properties payload with before/after snapshots where relevant.

### List Activity Logs

```
GET /activity-logs
```

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `log_name` | string | e.g. `delivery`, `dispatcher`, `user`, `wallet` |
| `causer_id` | int | Admin user id |
| `causer_type` | string | Usually `App\Models\Admin` |
| `subject_type` | string | e.g. `App\Models\Delivery` |
| `subject_id` | int | The ID of the affected record |
| `event` | string | e.g. `updated`, `created` |
| `from` | date `YYYY-MM-DD` | Start of date range |
| `to` | date `YYYY-MM-DD` | End of date range |
| `per_page` | int | Default 25 |

**Response `200`:**
```json
{
  "status": true,
  "message": "Activity logs fetched successfully",
  "data": {
    "data": [
      {
        "id": 912,
        "log_name": "delivery",
        "description": "delivery.fare_overridden",
        "subject_type": "App\\Models\\Delivery",
        "subject_id": 55,
        "causer_type": "App\\Models\\Admin",
        "causer_id": 1,
        "properties": {
          "reason": "Customer dispute",
          "before": { "total_amount": 2500, "base_fare": 1800 },
          "after":  { "total_amount": 3000, "base_fare": 2000 }
        },
        "event": "updated",
        "created_at": "2026-04-20T10:10:00.000000Z",
        "causer": { "id": 1, "name": "Admin Name", "email": "admin@example.com" },
        "subject": { "id": 55, "tracking_code": "DEL-XXXXXX" }
      }
    ],
    "current_page": 1,
    "total": 912
  }
}
```

### Get Activity Log Entry

```
GET /activity-logs/{id}
```

**Response `200`:** single log entry, same shape as the list item above.

**Error `404`** if no log entry exists for the given id.

### Log Name Reference

| `log_name` | Events emitted |
|------------|----------------|
| `delivery` | `delivery.reassigned`, `delivery.payment_updated`, `delivery.fare_overridden`, `delivery.force_completed`, `delivery.refunded`, `delivery.issue_resolved` |
| `dispatcher` | `dispatcher.approved`, `dispatcher.suspended`, `dispatcher.updated`, `dispatcher.wallet_credited`, `dispatcher.wallet_debited`, `dispatcher.wallet_reversed`, `dispatcher.document_reviewed`, `dispatcher.vehicle_document_reviewed` |
| `user` | `user.suspended`, `user.unsuspended`, `user.password_reset` |
| `delivery_category` | `delivery_category.created`, `delivery_category.updated`, `delivery_category.deleted`, `delivery_category.status_toggled` |
| `delivery_vehicle` | `delivery_vehicle.created`, `delivery_vehicle.updated`, `delivery_vehicle.deleted`, `delivery_vehicle.status_toggled` |

---

## Summary of New Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/settings/group/pricing` | Read pricing tunables |
| `PUT` | `/settings/{key}` | Update any pricing key |
| `GET` | `/delivery-categories` | List categories |
| `POST` | `/delivery-categories` | Create category |
| `GET` | `/delivery-categories/{id}` | Show category |
| `PUT` | `/delivery-categories/{id}` | Update category |
| `DELETE` | `/delivery-categories/{id}` | Delete category |
| `POST` | `/delivery-categories/{id}/toggle-status` | Toggle active |
| `GET` | `/delivery-vehicles` | List vehicle types |
| `POST` | `/delivery-vehicles` | Create vehicle type |
| `GET` | `/delivery-vehicles/{id}` | Show vehicle type |
| `PUT` | `/delivery-vehicles/{id}` | Update vehicle type |
| `DELETE` | `/delivery-vehicles/{id}` | Delete vehicle type |
| `POST` | `/delivery-vehicles/{id}/toggle-status` | Toggle active |
| `PUT` | `/dispatchers/{id}` | Update dispatcher |
| `POST` | `/dispatchers/{id}/wallet/reverse/{transactionId}` | Reverse wallet txn |
| `PATCH` | `/deliveries/{id}/fare` | Override fare |
| `POST` | `/deliveries/{id}/force-complete` | Force complete |
| `POST` | `/deliveries/{id}/refund` | Wallet refund |
| `GET` | `/deliveries/{id}/issues` | List issues |
| `POST` | `/deliveries/{id}/issues/{issueId}/resolve` | Resolve issue |
| `POST` | `/users/{id}/suspend` | Suspend user |
| `POST` | `/users/{id}/unsuspend` | Unsuspend user |
| `POST` | `/users/{id}/reset-password` | Reset password |
| `GET` | `/activity-logs` | Audit trail list |
| `GET` | `/activity-logs/{id}` | Audit trail entry |
