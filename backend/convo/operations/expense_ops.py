from django.db import connection
import json
from datetime import datetime

# =====================================================
# EXPENSE CREATION
# =====================================================


def create_expense(room_id, creator_id, total_amount, description, split_members):
    """
    Creates an expense and payment records for split_members.
    split_members: list of user_ids to split the bill with (excluding creator)
    """
    try:
        with connection.cursor() as cursor:
            print(
                f"DEBUG: Inserting expenses: room={room_id}, amt={total_amount}, desc={description}, creator={creator_id}")
            try:
                cursor.execute(
                    "INSERT INTO expenses (room_id, t_amount, description, created_by) VALUES (%s, %s, %s, %s)",
                    [room_id, total_amount, description, creator_id]
                )
            except Exception as e:
                print(f"DEBUG: Insert Failed: {e}")
                raise e
            expense_id = cursor.lastrowid

            # 2. Return if no members to split with (just personal expense?)
            if not split_members:
                return {"success": True, "expense_id": expense_id, "message": "Expense created (no split)"}

            # 3. Calculate Split Amount
            # Total users = split_members + creator = len(split_members) + 1
            num_users = len(split_members) + 1
            split_amount = float(total_amount) / num_users

            # 4. Create Payment Records
            values = []
            now = datetime.now()

            # 4a. Add Creator (Automatically PAID and CONFIRMED)
            values.append((expense_id, creator_id, split_amount,
                          'PAID', now, creator_id))

            # 4b. Add Split Members (PENDING)
            for member_id in split_members:
                values.append(
                    (expense_id, member_id, split_amount, 'PENDING', None, None))

            cursor.executemany(
                """
                INSERT INTO expense_payments (expense_id, user_id, amount, status, confirmed_at, confirmed_by)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                values
            )

            # 5. Broadcast 'EXPENSE_CREATED' event?
            # Handled by message flow if this is triggered by a message.
            # But we might want to return details so the view can send a message.

            return {
                "success": True,
                "expense_id": expense_id,
                "split_amount": split_amount,
                "created_at": datetime.utcnow().isoformat()
            }

    except Exception as e:
        return {"success": False, "message": str(e)}


# =====================================================
# PAYMENT OPERATIONS
# =====================================================
def submit_payment(payment_id, user_id, method):
    try:
        with connection.cursor() as cursor:
            # Verify user owns this payment
            cursor.execute(
                "SELECT expense_id FROM expense_payments WHERE payment_id = %s AND user_id = %s",
                [payment_id, user_id]
            )
            row = cursor.fetchone()
            if not row:
                return {"success": False, "message": "Payment not found or access denied"}

            expense_id = row[0]

            # Update Status
            cursor.execute(
                """
                UPDATE expense_payments 
                SET status = 'SUBMITTED', payment_method = %s, submitted_at = NOW()
                WHERE payment_id = %s
                """,
                [method, payment_id]
            )

            return {
                "success": True,
                "expense_id": expense_id,
                "status": "SUBMITTED",
                "payment_id": payment_id
            }
    except Exception as e:
        return {"success": False, "message": str(e)}


def confirm_payment(payment_id, admin_id):
    try:
        with connection.cursor() as cursor:
            # Verify Admin (Creator of Expense)
            cursor.execute(
                """
                SELECT ep.expense_id, e.created_by, ep.user_id 
                FROM expense_payments ep
                JOIN expenses e ON ep.expense_id = e.expense_id
                WHERE ep.payment_id = %s
                """,
                [payment_id]
            )
            row = cursor.fetchone()
            if not row:
                return {"success": False, "message": "Payment not found"}

            expense_id, creator_id, payer_id = row

            if creator_id != admin_id:
                return {"success": False, "message": "Only expense creator can confirm payments"}

            # Update Status
            cursor.execute(
                """
                UPDATE expense_payments 
                SET status = 'PAID', confirmed_at = NOW(), confirmed_by = %s
                WHERE payment_id = %s
                """,
                [admin_id, payment_id]
            )

            return {
                "success": True,
                "expense_id": expense_id,
                "payer_id": payer_id,
                "status": "PAID",
                "payment_id": payment_id
            }
    except Exception as e:
        return {"success": False, "message": str(e)}


def reject_payment(payment_id, admin_id):
    try:
        with connection.cursor() as cursor:
            # Verify Admin
            cursor.execute(
                """
                SELECT ep.expense_id, e.created_by, ep.user_id 
                FROM expense_payments ep
                JOIN expenses e ON ep.expense_id = e.expense_id
                WHERE ep.payment_id = %s
                """,
                [payment_id]
            )
            row = cursor.fetchone()
            if not row:
                return {"success": False, "message": "Payment not found"}

            expense_id, creator_id, payer_id = row

            if creator_id != admin_id:
                return {"success": False, "message": "Only expense creator can reject payments"}

            # Update Status
            cursor.execute(
                """
                UPDATE expense_payments 
                SET status = 'REJECTED'
                WHERE payment_id = %s
                """,
                [payment_id]
            )

            return {
                "success": True,
                "expense_id": expense_id,
                "payer_id": payer_id,
                "status": "REJECTED",
                "payment_id": payment_id
            }
    except Exception as e:
        return {"success": False, "message": str(e)}


# =====================================================
# GET EXPENSE DETAILS
# =====================================================
def get_expense_details(expense_id, user_id):
    """
    Fetch full details for an expense card.
    """
    try:
        with connection.cursor() as cursor:
            # Expense Info
            cursor.execute(
                """
                SELECT e.expense_id, e.room_id, e.t_amount, e.description, e.created_by, u.first_name, e.created_at
                FROM expenses e
                JOIN users u ON e.created_by = u.user_id
                WHERE e.expense_id = %s
                """,
                [expense_id]
            )
            expense = cursor.fetchone()
            if not expense:
                return {"success": False, "message": "Expense not found"}

            expense_data = {
                "id": expense[0],
                "room_id": expense[1],
                # Return to frontend as total_amount
                "total_amount": float(expense[2]),
                "description": expense[3],
                "created_by": expense[4],
                "creator_name": expense[5],
                "created_at": expense[6].isoformat() if expense[6] else None
            }

            # Collection Progress
            cursor.execute(
                """
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
                    SUM(amount) as total_collectable
                FROM expense_payments
                WHERE expense_id = %s
                """,
                [expense_id]
            )
            stats = cursor.fetchone()
            total_users = stats[0]
            paid_count = stats[1] or 0

            expense_data["paid_count"] = paid_count
            expense_data["total_users"] = total_users
            expense_data["progress"] = (
                paid_count / total_users * 100) if total_users > 0 else 100

            # User specific status
            cursor.execute(
                """
                SELECT payment_id, amount, status, payment_method, submitted_at, confirmed_at
                FROM expense_payments
                WHERE expense_id = %s AND user_id = %s
                """,
                [expense_id, user_id]
            )
            my_payment = cursor.fetchone()

            if my_payment:
                expense_data["my_payment"] = {
                    "payment_id": my_payment[0],
                    "amount": float(my_payment[1]),
                    "status": my_payment[2],
                    "method": my_payment[3],
                }
            else:
                expense_data["my_payment"] = None  # Creator or not involved

            # Fetch all payments for Activity Log (Visible to all)
            cursor.execute(
                """
                SELECT ep.payment_id, ep.user_id, ep.amount, ep.status, ep.payment_method, u.first_name, u.profile_pic, ep.submitted_at, ep.confirmed_at
                FROM expense_payments ep
                JOIN users u ON ep.user_id = u.user_id
                WHERE ep.expense_id = %s
                ORDER BY ep.submitted_at DESC
                """,
                [expense_id]
            )
            all_payments = []
            for row in cursor.fetchall():
                all_payments.append({
                    "payment_id": row[0],
                    "user_id": row[1],
                    "amount": float(row[2]),
                    "status": row[3],
                    "method": row[4],
                    "user_name": row[5],
                    "profile_pic": row[6],
                    "submitted_at": row[7].isoformat() if row[7] else None,
                    "confirmed_at": row[8].isoformat() if row[8] else None
                })
            expense_data["all_payments"] = all_payments

            return {"success": True, "expense": expense_data}

    except Exception as e:
        return {"success": False, "message": str(e)}
