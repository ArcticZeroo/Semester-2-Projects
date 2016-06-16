// ConsoleApplication1.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "app.h"
#include <iostream>
#include <Windows.h>

int main()
{
	SetConsoleTitle(TEXT("Test Application 1"));
	for (int i = 0; i <= 10; i++) {
		int printVal = i * i;
		std::cout << printVal << std::endl;
	}
}

