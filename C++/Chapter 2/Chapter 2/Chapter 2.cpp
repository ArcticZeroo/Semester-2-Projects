// Chapter 2.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include "myMath.h"

int main()
{
	std::cout << myMath::pi << std::endl;
	int rabbit = myMath::add(4, 7);
	int cast = static_cast<int>(myMath::pi);
	std::cout << rabbit << std::endl << cast << std::endl;
    return 0;
}

