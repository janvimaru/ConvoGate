import random
import string


def generate_room_pin():
    # 6 digit numeric PIN
    return "".join(random.choices(string.digits, k=6))
