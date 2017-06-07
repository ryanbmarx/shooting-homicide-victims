'''
This app is for reporters to have a tool for analysis.
'''
from tkinter import Tk
from tkinter.filedialog import askopenfilename
import pandas as pd
import numpy as np



'''
Shooting Analysis Tool - Chicago Tribue, Data Viz Team
By: Mowafak Allaham
Date: 06/07/2017
'''


print ('Please choose the CSV file you are interested in analyzing: \n')
Tk().withdraw() # we don't want a full GUI, so keep the root window from appearing
filename = askopenfilename() # show an "Open" dialog box and return the path to the selected file
#print(filename)


def getByYear(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print (shootings.groupby([shootings['Date'].dt.year])['Date'].count())
	print ('===============================================================')
def getByMonth(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print (shootings.groupby([shootings['Date'].dt.year,shootings['Date'].dt.month]).count()['Date'])
	print ('===============================================================')
def getByDay(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print(shootings.groupby([shootings['Date'].dt.day]).count()['Date'])
	print ('===============================================================')
def getByTime(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print ('Under Construction')
	print ('===============================================================')

def getByDistric(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print (shootings.groupby('District')['District'].count())
	print ('===============================================================')
def getByAge(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print ('Under Construction')
	print ('===============================================================')

def getBySex(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print(shootings.groupby('Sex')['Sex'].count())
	print ('===============================================================')
def getBySexYM(shootings):
	nSex = pd.DataFrame(shootings.groupby([shootings['Date'].dt.year,shootings['Date'].dt.month,shootings['Sex']])['Date'].count())
	nSex.columns = ['num_shootings'] #reseting the column names
	nSex.index.names = ['Year','Month','Sex'] #reseting index names
	print ('\n')
	print ('==============================Ouput============================')
	print (nSex)
	print ('===============================================================')
def getByR_Time(shootings):
	print ('\n')
	print ('==============================Ouput============================')
	print ('Under Construction')
	print ('===============================================================')



print ('Choose from the following options:')
shootings = pd.read_csv(filename)
shootings['Date'] = pd.to_datetime(shootings['Date'])
while True:
	try:
		option = int(input("""
		----------------------------------------------------------
		1. Number of shootings by year\n
		2. Number of shootings by month\n
		3. Number of shootings by day\n
		4. Number of shootings by time of the day (in process)\n
		5. Number of shootings by district\n
		6. Number of shootings by age (in process)\n 
		7. Number of shootings by sex\n
		8. Number of shootings by sex per year and per month\n
		9. Number of shootings within a specific range of time\n
		10. Choose another file to analyze\n
		----------------------------------------------------------
		"""))

		if (option == 1):
			getByYear(shootings)
		if (option == 2):
			getByMonth(shootings)
		if (option == 3):
			getByDay(shootings)
		if (option == 4):
			getByTime(shootings)
		if (option == 5):
			getByDistric(shootings)
		if (option == 6):
			getByAge(shootings)
		if (option == 7):
			getBySex(shootings)
		if (option == 8):
			getBySexYM(shootings)
		if (option == 9):
			getByR_Time(shootings)
		if(option==10):
			option = int(input("""
			----------------------------------------------------------
			1. Number of shootings by year\n
			2. Number of shootings by month\n
			3. Number of shootings by day\n
			4. Number of shootings by time of the day (in process)\n
			5. Number of shootings by district\n
			6. Number of shootings by age (in process)\n 
			7. Number of shootings by sex\n
			8. Number of shootings by sex per year and per month\n
			9. Number of shootings within a specific range of time\n
			10. Choose another file to analyze\n
			----------------------------------------------------------
			"""))
	except ValueError:
		print ('Please only enter a number between 1 and 10')
