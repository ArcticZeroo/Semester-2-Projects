import math

class Shape(object):
    def __init__(self, shape, perimeter, area):
        self.type = shape
        self.area = area
        self.perimeter = perimeter

userShape = input("Please input the shape (circle/rectangle/square/triangle): ")
shape = None
if userShape == "rectangle":
    width = int(input("Please input the width: "))
    height = int(input("Please input the height: "))
    perimeter = (2 * width) + (2 * height)
    area = width * height
    shape = Shape("rectangle", perimeter, area)
elif userShape == "square":
    side = int(input("Please enter a side: "))
    perimeter = 4 * side
    area = side**2
    shape = Shape("square", perimeter, area)
elif userShape == "circle":
    radius = int(input("Please enter the radius: "))
    perimeter = 2 * math.pi * radius
    area = math.pi * (radius**2)
    shape = Shape("circle", perimeter, area)

print('Your %s has a perimeter of %s and an area of %s' % (shape.type, shape.perimeter, shape.area))
