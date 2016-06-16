// Chapter 6.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <utility>

//6.3
void arrayScores63() {
	const int arrayLength(9);
	int array[arrayLength] = { 4, 6, 7, 3, 8, 2, 1, 9, 5 };

	for (int i = 0; i < arrayLength; i++) {
		std::cout << array[i] << "\n";
	}
}
void arrayScoresAsk63() {
	int response;
	do {
			std::cout << "Please enter a number 1-9: ";
			std::cin >> response;

			// if the user entered something invalid
			if (std::cin.fail())
			{
				std::cin.clear(); // reset any error flags
				std::cin.ignore(32767, '\n'); // ignore any characters in the input buffer
				std::cout << "You entered an incorrect response. Please try again.\n";
			}
	} while (response < 1 || response > 9);

	const int arrayLength(9);
	int array[arrayLength] = { 4, 6, 7, 3, 8, 2, 1, 9, 5 };

	for (int i = 0; i < arrayLength; i++) {
		if (array[i] == response) {
			std::cout << "Index: " << i << "\n";
			break;
		}
	}
}
void maxScores63() {
	const int numStudents(5);
	int scores[numStudents] = { 84, 92, 76, 81, 56 };
	int maxIndex = 0; // keep track of our largest score
	for (int student = 0; student < numStudents; ++student) {
		if (scores[student] > scores[maxIndex]) {
			maxIndex = student;
		}
	}
	std::cout << "The best score was " << scores[maxIndex] << '\n';
}

//6.4
void backwardsSort64() {
	const int size = 5;
	int array[size] = { 30, 50, 20, 10, 40 };

	// Step through each element of the array
	for (int startIndex = 0; startIndex < size; ++startIndex)
	{
		// largestIndex is the index of the largest element we've encountered so far.
		int largestIndex = startIndex;

		// Search through every element starting at startIndex+1
		for (int currentIndex = startIndex + 1; currentIndex < size; ++currentIndex)
		{
			// If the current element is smaller than our previously found largest
			if (array[currentIndex] > array[largestIndex])
				// This is the new largest number for this iteration
				largestIndex = currentIndex;
		}

		// Swap our start element with our largest element
		std::swap(array[startIndex], array[largestIndex]);
	}

	// Now print our sorted array as proof it works
	for (int index = 0; index < size; ++index)
		std::cout << array[index] << ' ';

}
void bubbleSort64() {
	const int size(9);
	int array[size] = { 6, 3, 2, 9, 7, 1, 5, 4, 8 };
	for (int iterations = 0; iterations < size; iterations++) {
		bool sorted = false;
		for (int index = 0; index < size-1; index++) {
			if (array[index + 1] < array[index]) {
				std::swap(array[index + 1], array[index]);
				sorted = true;
			}
		}
		if (!sorted) {
			std::cout << "Array Sorted in " << iterations-1 << " iterations.\n";
			break;
		}
		std::cout << "Iteration: " << iterations << "\n";
		std::cout << "Array: {";
		for (int index = 0; index < size; index++) {
			std::cout << " " << array[index];
		}
		std::cout << " }\n\n";
	}
	std::cout << "Final Array: {";
	for (int index = 0; index < size; index++) {
		std::cout << " " << array[index];
	}
	std::cout << " }\n\n";
}

//Pointers - General
void pointerTest() {
	// * is the value at an address, & is the address of a value
	int number = 7;
	std::cout << number << "\n";
	int *ptr = &number; //Defines a pointer
	std::cout << *ptr << "\n"; //Prints number (7)
	std::cout << &ptr << "\n"; //prints address of pointer
	std::cout << &*ptr << "\n"; //prints address of the value of the pointer
	std::cout << ptr << "\n"; //prints value of pointer (address of number)
	*ptr = 4; //changes the value of number
	std::cout << *ptr << "\n";
	std::cout << number << "\n";

	int *nullPtr(0); //Null pointer
	int *nulllPtr(NULL); //Null pointer
	//Both are bad practice, so do this:
	int *nullPtrGood = nullptr;
}
void pointerIteration() {
	const int arraySize = 7;
	char name[arraySize] = "Mollie";
	int numVowels(0);
	for (char *ptr = name; ptr < name + arraySize; ++ptr)
	{
		std::cout << "*ptr: " << *ptr;
		std::cout << " ptr: " << ptr;
		std::cout << " name: " << name << "\n";
		switch (*ptr)
		{
		case 'A':
		case 'a':
		case 'E':
		case 'e':
		case 'I':
		case 'i':
		case 'O':
		case 'o':
		case 'U':
		case 'u':
			numVowels++;
		}
	}

	std::cout << name << " has " << numVowels << " vowels.\n";
}

int main()
{
	pointerIteration();
	return 0;
}

