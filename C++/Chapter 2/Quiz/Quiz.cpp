// Quiz.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include "constants.h"

int main()
{
	std::cout << "Input the height of the ball in meters. \n";
	unsigned int ballHeight;
	std::cin >> ballHeight;

	bool hitGround = false;
	for (int i = 1; i <= 15; i++) {
		double distFallen = myConstants::gravity * ((i*i) / 2);
		double newHeight = ballHeight - distFallen;
		if (newHeight > 0) {
			std::cout << "At " << i << " seconds, the ball is at " << newHeight << " meters. \n";
		}
		else if (newHeight <= 0 && !hitGround) {
			std::cout << "The ball hit the ground at " << i << " seconds.\n";
			hitGround = true;
		}
	}

    return 0;
}

