import cv2
import numpy as np

# Load a card image and drink image
card = cv2.imread("assets/images/menu/matcha-latte_card.jpg")
drink = cv2.imread("assets/images/menu/matcha-latte.jpg")

print("card shape:", card.shape if card is not None else None)
print("drink shape:", drink.shape if drink is not None else None)
