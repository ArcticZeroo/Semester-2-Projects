#IMPORTS
import math
#END IMPORTS

class Shape(object):
    def __init__(self):
        pass

    def getPerimeter(self):
        return (self.base*2) + (self.height*2)

    def getArea(self):
        return self.base*self.height

class Triangle(Shape):
    def __init__(self, side1, side2, side3):
        self.name = "Triangle"
        self.side1 = side1
        self.side2 = side2
        self.side3 = side3
        self.perimeter = self.getPerimeter()
        self.area = self.getArea()

    def getPerimeter(self):
        return self.side1 + self.side2 + self.side3

    def getArea(self):
        p = self.perimeter/2
        return math.sqrt(p * (p - self.side1) * (p - self.side2) * (p - self.side3))

class Rectangle(Shape):
    def __init__(self, height, width):
        self.name = "Rectangle"
        self.height = height
        self.base = width
        self.perimeter = self.getPerimeter()
        self.area = self.getArea()

class Square(Rectangle):
    def __init__(self, side):
        self.name = "Square"
        self.base = self.height = side
        self.perimeter = self.getPerimeter()
        self.area = self.getArea()

class Circle(Shape):
    def __init__(self, radius):
        self.name = "Circle"
        self.radius = radius
        self.perimeter = self.getPerimeter()
        self.area = self.getArea()

    def getPerimeter(self):
        return 2.0 * math.pi * self.radius

    def getArea(self):
        return math.pi * (self.radius**2)

#Returns a string with the user's shape selection. Will repeat the question if they enter something not in the shape list.
def getShape():
    shapes = ["rectangle", "square", "circle", "triangle"]
    response = ""
    while response not in shapes:
        response = str(input("Please enter a shape (rectangle/square/circle/triangle): ")).lower()
    else:
        return response

#Returns a class of the shape with measurements inserted. Will repeat question if they enter a non-integer.
def getMeasurements(shape):
    if shape == "rectangle":
        width = ""
        while not width.isdigit():
            width = input("Please enter the width: ")
        else:
            width = int(width)

        height = ""
        while not height.isdigit():
            height = input("Please enter the height: ")
        else:
            height = int(height)

        return Rectangle(height, width)

    elif shape == "square":
        side = ""
        while not side.isdigit():
            side = input("Please enter a side length: ")
        else:
            side = int(side)

        return Square(side)

    elif shape == "triangle":
        side1 = ""
        while not side1.isdigit():
            side1 = input("Please enter side 1: ")
        else:
            side1 = int(side1)

        side2 = ""
        while not side2.isdigit():
            side2 = input("Please enter side 2: ")
        else:
            side2 = int(side2)

        side3 = ""
        while not side3.isdigit():
            side3 = input("Please enter side 3: ")
        else:
            side3 = int(side3)

        return Triangle(side1, side2, side3)
    elif shape == "circle":
        radius = ""
        while not radius.isdigit():
            radius = input("Please enter the radius: ")
        else:
            radius = int(radius)

while True:
    #Gets shape class
    shape = getMeasurements(getShape())

    #Print shape information
    print("Your {} has a perimeter of {} units and an area of {} units.".format(shape.name, shape.perimeter, shape.area))

    #Lets user repeat
    response = ""
    while not response.startswith('y') and not response.startswith('n'):
        response = input("Want to enter another shape? (y/n): ").lower()
    else:
        if response.startswith('n'):
            break
