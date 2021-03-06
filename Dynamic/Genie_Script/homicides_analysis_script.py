
# Descriptive Analysis of Homicides in Chicago
# Pulling Homicide data from Newsroom DB

#get pandas and numpy
import pandas as pd
import numpy as np
import requests
import io
from datetime import datetime


def date_missing_january(x):
		all_years = set(x['Year'].unique().tolist())
		years_in_data = set(x.loc[(x['Month']==1) & (x['Day']==1)]['Year'].unique().tolist())
		missing_years = all_years - years_in_data
		for y in missing_years:
			x.loc[len(x)] = [y,1,1,0,0]
		return (x)
	
def date_missing_december(x):
	all_years = set(x['Year'].unique().tolist())
	years_in_data = set(x.loc[(x['Month']==12) & (x['Day']==31)]['Year'].unique().tolist())
	missing_years = all_years - years_in_data
	for y in missing_years:
		if(y!=datetime.now().year): #if we are plotting data and the year is equals to the current year, don't fill anything as we haven't reached 12/31 yet.
		#the above if statement was necessary to remove the constant linear part of the homicides plot.
			x.loc[len(x)] = [y,12,31,0,0]
	return (x)
	
def clean_age(age):
    try:
        return int(str(age).strip())
    except:
        return (0)

def isMurder(s):
    if (s.strip() =='Yes'):
        return (1)
    else:
        return(0)

def date_to_t(t): #date to time
    if(t==''):
        return (t)
    else:
        return (datetime.strptime(str(t) ,'%H:%M').time()) #converting dates from type string to type date and time


def date_to_dt(x): #date to datetime format
    if(x==''):
        return (x)
    else:
        return (datetime.strptime(str(x) ,'%Y-%m-%d').date()) #converting dates from type string to type date and time

def get_homicides(homicides,outputPath):

	homicides['Occ Date']=homicides['Occ Date'].replace(np.nan,'') #replacing empty NaN values with empty strings
	    
	homicides['Occ Date']=homicides['Occ Date'].apply(date_to_dt)


	# In[4]:

	homicides['Occ Date']= pd.to_datetime(homicides['Occ Date'],errors='coerce') #apply pandas date and time function for future indexing


	# In[5]:

	#focusing on homicides from 2012 onwards
	homicides = homicides[homicides['Occ Date'].dt.year>2012]


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
	#######################################
	# we found that charts are breaking for some years because the dates 01/01/YYYY and 12/31/YYYY is not present.
	# In this step, we are manually appending those dates for years that are missing with a value of 0 for their cum_sum.
	tmp_output = output
	tmp_output = date_missing_january(tmp_output)
	tmp_output = date_missing_december(tmp_output)
	output = tmp_output
	output.sort_values(by=['Year','Month','Day','num_of_homicides','cum_sum'],ascending=[True,True,True,False,False],inplace=True)
	output = output.reset_index() #index must be reset after appending at missing_date_january and missing_date_december.
	output = output.drop('index',axis=1) #removing previous index, which based on appending a row to the end of a dataframe
	#avoiding any rows with cum_sum ==0
	index_list = output.loc[output['cum_sum']==0].index.tolist()
	#print (index_list)
	for index in index_list:
		#print(output.iloc[index]['cum_sum'])
		#print (output.iloc[index-1]['cum_sum'])
		#print ("***********")
		if((output.iloc[index]['Month']!=1) & (output.iloc[index]['Day']!=1)): #if it's the first day of the year, don't change it as the cum_sum for some years is equal to zero
			output.iloc[index]['cum_sum']=output.iloc[index-1]['cum_sum']
	output = output
	#print (output.columns)
	############################################

	output['ID'] = np.arange(0,len(output),1) #adding ID column
	output.columns = ['YEAR','MONTH','DAY','NUM_OF_INCIDENTS','CUMULATIVE_SUM','ID']
	output.to_csv(outputPath,index=True)

	#####geo-coding######
	homicides['Geocode Override']=homicides['Geocode Override'].replace(np.nan,'')
	geoDF = homicides[['Occ Date','Occ Time','Age','Sex','Race','Geocode Override','District Number','District Name',
	'Neighborhood Name','Community Name','Story','Murder','Pub Cause']]
	
	geoDF['lat'],geoDF['long'] = homicides['Geocode Override'].str.replace('(','').str.replace(')','').str.split(',').str
	geoDF['Murder'] = geoDF['Murder'].replace(np.nan,'')
	geoDF['isMurder'] = geoDF['Murder'].apply(isMurder)
	geoDF['isFatal']=[1]*len(geoDF)
	geoDF['Age'] = geoDF['Age'].replace(np.nan,-1) #replacing empty cells with -1
	geoDF['Age'] = geoDF['Age'].apply(clean_age) #recoding the Age column. Any reported age in alphabetical strings (e.g, 1 week, day, 3 months.) will be assigned a value of zero.
	#time
	geoDF['Occ Time']=geoDF['Occ Time'].replace(np.nan,'') #replacing empty NaN values with empty strings
	geoDF['Hour']=geoDF['Occ Time'].apply(date_to_t)
	geoDF['Hour HH'] = [m.hour if m!='' else -1 for m in geoDF['Hour']]
	geoDF['Minutes MM'] = [m.minute if m!='' else -1 for m in geoDF['Hour']]
	
	#NAMES/ID
	geoDF['ID'] = np.arange(0,len(geoDF),1)
	geoDF['NAME_FIRST'] = homicides['First Name']
	geoDF['NAME_LAST'] = homicides['Last Name']
	geoDF.columns = ['DATE','TIME','AGE','SEX','RACE','GEOCODE_OVERRIDE','DISTRICT_NUM',
	'DISTRICT_NAME','NEIGHBORHOOD_NAME','COMMUNITY_NAME','LINK','MURDER','PUB_CAUSE','LAT','LNG','IS_MURDER','IS_FATAL','HOUR','HOUR_HH','MINUTES_MM','ID', 'NAME_FIRST', 'NAME_LAST']

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