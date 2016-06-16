// Chapter 4.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <string>

//Structs
//>Practice 1
/*struct advertising {
	int shown;
	double clickRate;
	double avgEarnings;
};

void printValues(advertising advertisement) {
	std::cout << "\n\nAds Shown: " << advertisement.shown << 
		"\nClick Rate: " << advertisement.clickRate << "%" <<
		"\nAverage Earnings: $" << advertisement.avgEarnings << " per click" <<
		"\nTotal Earned: $" << (advertisement.clickRate/100) * advertisement.shown * advertisement.avgEarnings <<
		"\n\n\n";
}

int main() {
	
	advertising website;

	std::cout << "How many ads were shown? ";
	std::cin >> website.shown;

	std::cout << "What percentage of people clicked the ad (as an integer)? ";
	std::cin >> website.clickRate;

	std::cout << "How much was earned on average for each click (as a double)? ";
	std::cin >> website.avgEarnings;

	printValues(website);

	return 0;
}*/
//>Practice 2
/*struct fraction {
	double numerator;
	double denominator;
	double value;
};

int main(){

	fraction firstFrac, secondFrac;

	std::cout << "Please enter the numerator of the first fraction: ";
	std::cin >> firstFrac.numerator;

	std::cout << "Please enter the denominator of the first fraction: ";
	std::cin >> firstFrac.denominator;

	firstFrac.value = firstFrac.numerator / firstFrac.denominator;

	std::cout << "\nPlease enter the numerator of the second fraction: ";
	std::cin >> secondFrac.numerator;

	std::cout << "Please enter the denominator of the second fraction: ";
	std::cin >> secondFrac.denominator;

	secondFrac.value = secondFrac.numerator / secondFrac.denominator;

	std::cout << "The product of the fractions is " << firstFrac.value * secondFrac.value << "\n";

	return 0;
}*/

//Quiz
enum class MonsterType {
	OGRE,
	DRAGON,
	ORC,
	GIANT_SPIDER,
	SLIME
};

struct Monster {
	MonsterType type;
	std::string name;
	int health;
};

std::string getMonsterType(Monster monster) {
	if (monster.type == MonsterType::OGRE) {
		return "Ogre";
	}if (monster.type == MonsterType::DRAGON) {
		return "Dragon";
	}if (monster.type == MonsterType::ORC) {
		return "Orc";
	}if (monster.type == MonsterType::GIANT_SPIDER) {
		return "Giant Spider";
	}if (monster.type == MonsterType::SLIME) {
		return "Slime";
	}
	return "Unknown";
}

void printMonster(Monster monster) {
	std::cout << "This " << getMonsterType(monster) << " is named " << monster.name << " and has " << monster.health << " health.\n";
}

int main(){

	Monster ogre;
	ogre.type = MonsterType::OGRE;
	ogre.name = "Torg";
	ogre.health = 145;

	Monster slime;
	slime.type = MonsterType::SLIME;
	slime.name = "Blurp";
	slime.health = 23;
	
	printMonster(ogre);
	printMonster(slime);

	return 0;
}