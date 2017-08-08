
# Descriptive Analysis of Homicides in Chicago
# Pulling Homicide data from Newsroom DB

#To-do list:
## Number of homicides' victims by race
## Number of homicides' victims by age

#get pandas and numpy
import pandas as pd
import numpy as np
import seaborn as sns
import requests
import io
from datetime import datetime


def crap_to_dt(x):
    if(x==''):
        return (x)
    else:
        return (datetime.strptime(str(x) ,'%Y-%m-%d').date()) #converting dates from type string to type date and time

def get_homicides(homicides,outputPath):

	homicides['Occ Date']=homicides['Occ Date'].replace(np.nan,'') #replacing empty NaN values with empty strings
	    
	homicides['Occ Date']=homicides['Occ Date'].apply(crap_to_dt)


	# In[4]:

	homicides['Occ Date']= pd.to_datetime(homicides['Occ Date'],errors='coerce') #apply pandas date and time function for future indexing


	# In[5]:

	#focusing on homicides from 2012 onwards
	homicides = homicides[homicides['Occ Date'].dt.year>2011]


	# In[6]:

	hByMonth = pd.DataFrame(homicides.groupby([homicides['Occ Date'].dt.year,homicides['Occ Date'].dt.month]).count()['Occ Date'])
	hByMonth.columns = ['num_of_homicides']
	hByMonth.index.names = ['Year','Month']
	hByMonth


	# # Cumalitive number of homicides per year 
	# (used to generate line charts on the crime website)

	# In[7]:

	np.cumsum([1,1,1])


	# In[8]:

	'''
	preparing data for visualization charts
	Tallying the number of shootings per year.
	e.g, in 2017:
	1st day of january had 3 shootings, 2nd 4 shootings, by the 31st day the total in january is 200.
	Now, in the 1st of February there were 10 shootings. Therefore the total number of shootings in 2017 until Feb 1st
	is 200 + 10 = 210.
	This is useful to generate the line plots.
	'''
	output = pd.DataFrame(homicides.groupby([homicides['Occ Date'].dt.year,homicides['Occ Date'].dt.month,homicides['Occ Date'].dt.day])['Occ Date'].count())
	output.columns = ['num_of_homicides']
	output.index.names = ['Year','Month','Day']
	output = output.reset_index()
	cum_sum = []
	for y in output['Year'].unique().tolist():
	    v= np.cumsum(output[output['Year']==y]['num_of_homicides'])
	    cum_sum.append(v.tolist())
	output['cum_sum'] = [cs for l in cum_sum for cs in l] #looping through a list of lists
	output #tally number of shootings per day
	#output this file so that Kyle can use it for plotting


	# In[9]:

	output['ID'] = np.arange(0,len(output),1) #adding ID column
	output.columns = ['YEAR','MONTH','DAY','NUM_OF_SHOOTINGS','CUMULATIVE_SUM','ID']
	output.to_csv(outputPath,index=False)


	# # Number of homicides by neighborhood

	# In[11]:

	hByneighborhood = homicides.groupby('Neighborhood Name')['Occ Date'].count().reset_index()
	hByneighborhood = hByneighborhood[hByneighborhood['Neighborhood Name']!=' '] #excluding rows with empty spaces
	hByneighborhood.columns = ['Neighborhood Name','Number of homicides']
	hByneighborhood.sort_values(by='Number of homicides',ascending=False)
	hByneighborhood.to_csv('homicidesByNeighborhood.csv',index=False)


	# # Number of homicides by community name

	# In[12]:

	hBycommunity = homicides.groupby('Community Name')['Occ Date'].count().reset_index()
	hBycommunity.columns = ['Community Name','Number of homicides']
	hBycommunity.sort_values(by='Number of homicides',ascending=False)
	hBycommunity.to_csv('homicidesBycommunity.csv',index=False)


	# # Demographics of Victims

	# In[13]:

	vBysex = homicides['Sex'].value_counts()
	vBysex = pd.DataFrame(vBysex)
	print ('overall number of victims by sex is:')
	print(vBysex)


	# In[14]:

	vByMonth_Sex = pd.DataFrame(homicides.groupby([homicides['Occ Date'].dt.year,homicides['Occ Date'].dt.month,homicides['Sex']])['Occ Date'].count())
	vByMonth_Sex.columns = ['num_homicides'] #reseting the column names
	vByMonth_Sex.index.names = ['Year','Month','Sex'] #reseting index names
	#print(vByMonth_Sex)
	vByMonth_Sex.reset_index(inplace=True)


	# ### Average number of homicides' victims by sex

	# In[15]:

	print("Average number of homicides' victims by sex: \n")
	print(vByMonth_Sex.groupby(['Year','Sex'])['num_homicides'].mean())


	# ### Total number of homocides' victims by sex

	# In[16]:

	print("Total number of homocides' victims by sex in each year: \n")
	print(vByMonth_Sex.groupby(['Year','Sex'])['num_homicides'].sum())


	# ### Cause of death among homicides' victims

	# In[17]:

	print('Most common causes of death in homicides over the years: \n')
	print(homicides['Pub Cause'].value_counts())

	#creating two columns month and day that include the month and day when a homicide have occured.
	homicides['Month'] = homicides['Occ Date'].dt.month
	homicides['Day'] = homicides['Occ Date'].dt.strftime('%A')
	homicides['Occ Time'] = homicides['Occ Time'].replace(np.nan,'')
	homicides['Homicide_Time'] = homicides['Occ Time'].apply(lambda x: datetime.strptime(str(x),'%H:%M').strftime('%I:%M %p') if x!='' else '') 
	#adding strftime will convert the hours from 24 to 12 format. %p will indicate whether the time is AM or PM.
	homicides['ID'] = np.arange(0,homicides.shape[0],1)
	homicides[['Month','Day','Homicide_Time','ID']].to_csv('when_homicide_occur.csv')

