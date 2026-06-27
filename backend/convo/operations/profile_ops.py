from django.db import connection


def get_user_profile(user_id):
    """
    Fetches full user profile by joining users and user_profiles tables.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.phone, u.profile_pic,
                   up.bio, up.location, up.status_message, u.dob
            FROM users u
            LEFT JOIN user_profiles up ON u.user_id = up.user_id
            WHERE u.user_id = %s
        """, [user_id])
        row = cursor.fetchone()

        if not row:
            return None

        return {
            "user_id": row[0],
            "first_name": row[1],
            "last_name": row[2],
            "username": row[3],
            "email": row[4],
            "phone": row[5],
            "bio": row[7],
            "location": row[8],
            "status_message": row[9],
            "dob": row[10],
            "profile_pic": row[6],
            "full_name": f"{row[1]} {row[2]}".strip() if row[1] or row[2] else row[3]
        }


def update_user_profile(user_id, first_name, last_name, bio, location, status_message, phone=None, dob=None):
    """
    Updates user profile in users and user_profiles tables.
    """
    with connection.cursor() as cursor:
        # 1. Update users table
        cursor.execute("""
            UPDATE users 
            SET first_name = %s,
                last_name = %s,
                phone = COALESCE(%s, phone),
                dob = COALESCE(%s, dob)
            WHERE user_id = %s
        """, [first_name, last_name, phone, dob, user_id])

        # 2. Update or Insert into user_profiles
        cursor.execute("""
            INSERT INTO user_profiles (user_id, bio, location, status_message)
            VALUES (%s, NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''))
            ON DUPLICATE KEY UPDATE
                bio = VALUES(bio),
                location = VALUES(location),
                status_message = VALUES(status_message)
        """, [user_id, bio, location, status_message])

    return True


def update_profile_pic(user_id, profile_pic_path):
    """
    Directly updates the profile_pic column for a user with relative file path.
    """
    with connection.cursor() as cursor:
        cursor.execute("UPDATE users SET profile_pic = %s WHERE user_id = %s", [
                       profile_pic_path, user_id])
    return True
