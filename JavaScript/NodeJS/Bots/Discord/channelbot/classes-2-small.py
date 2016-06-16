import math

class Shape(object):
    def __init__(self, shape, perimeter, area):
        self.type = shape
        self.area = area
        self.perimeter = perimeter

userShape = input("Please input the shape (circle/rectangle/square/triangle): ")
shape = None
if userShape == "rectangle":
    width = input("Please input the width: ")
    height = input("Please input the height: ")
    perimeter = (2 * width) + (2 * height)
    area = width * height
    shape = Shape("rectangle", perimeter, area)
elif userShape == "square":
    side = input("Please enter a side: ")
    perimeter = 4 * side
    area = side**2
    shape = Shape("square", perimeter, area)
elif userShape == "circle":
    radius = input("Please enter the radius: ")
    perimeter = 2 * math.pi * radius
    area = math.pi * (radius**2)
    shape = Shape("circle", perimeter, area)

print('Your %d has a perimeter of %d and an area of %d' % (shape.type, shape.perimeter, shape.area))
