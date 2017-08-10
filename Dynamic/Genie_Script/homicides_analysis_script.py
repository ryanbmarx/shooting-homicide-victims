
# Descriptive Analysis of Homicides in Chicago
# Pulling Homicide data from Newsroom DB

#To-do list:
## Number of homicides' victims by race
## Number of homicides' victims by age

#get pandas and numpy
import pandas as pd
import numpy as np
import requests
import io
from datetime import datetime


def isFatal(s):
    if (s.strip() =='Yes'):
        return (1)
    else:
        return(0)

def crap_to_t(t):
    if(t==''):
        return (t)
    else:
        return (datetime.strptime(str(t) ,'%H:%M').time()) #converting dates from type string to type date and time


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
	output.columns = ['YEAR','MONTH','DAY','NUM_OF_INCIDENTS','CUMULATIVE_SUM','ID']
	output.to_csv(outputPath,index=False)

	#####geo-coding######
	homicides['Geocode Override']=homicides['Geocode Override'].replace(np.nan,'')
	geoDF = homicides[['Occ Date','Occ Time','Age','Sex','Race','Geocode Override','District Number','District Name',
	'Neighborhood Name','Community Name','Story','Murder','Pub Cause']]
	
	geoDF['lat'],geoDF['long'] = homicides['Geocode Override'].str.replace('(','').str.replace(')','').str.split(',').str
	geoDF['Murder'] = geoDF['Murder'].replace(np.nan,'')
	geoDF['isFatal']=geoDF['Murder'].apply(isFatal)

	#time
	geoDF['Occ Time']=geoDF['Occ Time'].replace(np.nan,'') #replacing empty NaN values with empty strings
	geoDF['Hour']=geoDF['Occ Time'].apply(crap_to_t)
	geoDF['Hour HH'] = [m.hour if m!='' else -1 for m in geoDF['Hour']]
	geoDF['Minutes MM'] = [m.minute if m!='' else -1 for m in geoDF['Hour']]
	geoDF['ID'] = np.arange(0,len(geoDF),1)
	geoDF.columns = ['DATE','TIME','AGE','SEX','RACE','GEOCODE_OVERRIDE','DISTRICT_NUM',
	'DISTRICT_NAME','NEIGHBORHOOD_NAME','COMMUNITY_NAME','LINK','MURDER','PUB_CAUSE','LAT','LNG','IS_FATAL','HOUR','HOUR_HH','MINUTES_MM','ID']

	#The output path already has ".csv" in it, so let's remove it before appending the geocode extentsion
	geocode_output_path = outputPath.replace('.csv', '')

	#geocode data to csv
	geoDF.to_csv(geocode_output_path + '_geocode.csv',index=False)
	

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

	'''
	#creating two columns month and day that include the month and day when a homicide have occured.
	homicides['Month'] = homicides['Occ Date'].dt.month
	homicides['Day'] = homicides['Occ Date'].dt.strftime('%A')
	homicides['Occ Time'] = homicides['Occ Time'].replace(np.nan,'')
	homicides['Homicide_Time'] = homicides['Occ Time'].apply(lambda x: datetime.strptime(str(x),'%H:%M').strftime('%I:%M %p') if x!='' else '') 
	#adding strftime will convert the hours from 24 to 12 format. %p will indicate whether the time is AM or PM.
	homicides['ID'] = np.arange(0,homicides.shape[0],1)
	#homicides[['ID','Month','Day','Homicide_Time','Story']].to_csv('when_homicide_occur.csv')
	'''