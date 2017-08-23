#get pandas and numpy
import pandas as pd
import numpy as np
import io
import requests
from datetime import datetime as dt
import warnings
warnings.filterwarnings("ignore")
#######
#Getting system arguments:
import sys
#######

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
		x.loc[len(x)] = [y,12,31,0,0]
	return (x)

def isFatal(s):
    if (s in ['110','0110','130','141','142']):
        return (1)
    else:
        return(0)


def date_to_dt(x):
    if(x==''):
        return (x)
    else:
        return (datetime.strptime(str(x) ,'%Y-%m-%d').date()) #converting dates from type string to type date and time


def date_to_t(t):
    if(t==''):
        return (t)
    else:
        return (datetime.strptime(str(t) ,'%H:%M').time()) #converting dates from type string to type date and time


def get_shootings(shootings,outputPath):

	shootings['Date']=shootings['Date'].replace(np.nan,'') #replacing empty NaN values with empty strings
	    
	shootings['Date']=shootings['Date'].apply(date_to_dt)

	shootings['Date']= pd.to_datetime(shootings['Date'],errors='coerce') #apply pandas date and time function for future indexing

	#after chatting with Jonathon B. on a Friday morning at 8:45 am, we decided to start looking at data from 2012 onwards.
	shootings = shootings[shootings['Date'].dt.year>2011]
	shootings.head(3)


	# #### Number of shootings by year:

	'''
	.count() is gives a count of a specific variable/column
	.groupby() chooses a variable (or group of variables) for which the data will be grouped by.
	'''
	output = pd.DataFrame(shootings.groupby([shootings['Date'].dt.year])['Date'].count())
	output.columns=['num_of_shootings']
	output.index.names = ['Year']
	output


	# #### Number of shootings by month in each year:

	output = pd.DataFrame(shootings.groupby([shootings['Date'].dt.year,shootings['Date'].dt.month]).count()['Date'])
	output.columns = ['num_of_shootings']
	output.index.names = ['Year','Month']
	output


	# #### Number of shooting by day:

	# #### Total number of shooting by day for 365 days per year 
	# (used to generate line charts on the crime website)

	'''
	preparing data for visualization charts
	Tallying the number of shootings per year.
	e.g, in 2017:
	1st day of january had 3 shootings, 2nd 4 shootings, by the 31st day the total in january is 200.
	Now, in the 1st of February there were 10 shootings. Therefore the total number of shootings in 2017 until Feb 1st
	is 200 + 10 = 210.
	This is useful to generate the line plots.
	'''
	output = pd.DataFrame(shootings.groupby([shootings['Date'].dt.year,shootings['Date'].dt.month,shootings['Date'].dt.day])['Date'].count())
	output.columns = ['num_of_shootings']
	output.index.names = ['Year','Month','Day']
	output = output.reset_index()
	cum_sum = []
	for y in output['Year'].unique().tolist():
	    v= np.cumsum(output[output['Year']==y]['num_of_shootings'])
	    cum_sum.append(v.tolist())
	output['cum_sum'] = [cs for l in cum_sum for cs in l]
	output #tally number of shootings per day
	#output this file so that Kyle can use it for plotting

	#######################################
	# we found that charts are breaking for some years because the dates 01/01/YYYY and 12/31/YYYY is not present.
	# In this step, we are manually appending those dates for years that are missing with a value of 0 for their cum_sum.
	tmp_output = output
	tmp_output = date_missing_january(tmp_output)
	tmp_output = date_missing_december(tmp_output)
	output = tmp_output
	output.sort_values(by=['Year','Month','Day','num_of_shootings','cum_sum'],ascending=[True,True,True,False,False],inplace=True)
	############################################
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

	output['ID'] = np.arange(0,len(output),1) #adding ID column
	#output.index.names=['ID']
	#output.reset_index()

	#outputs a csv file with todays date in the file name. This will help in tracking the updates.
	#output.to_csv(str(sys.argv[1])+'/number_of_shootings_up_to_'+str(dt.today().strftime("%m_%d_%Y"))+'.csv')

	output.columns = ['YEAR','MONTH','DAY','NUM_OF_INCIDENTS','CUMULATIVE_SUM','ID']
	#geo_coding_script.get_geo(shootings,outputpath)
	#output.to_csv(outputPath,index=False)

	#####geo-coding######
	shootings['Geocode Override']=shootings['Geocode Override'].replace(np.nan,'')
	geoDF = shootings[['Date','Sex','UCR','Age','Time','Shooting Location','Geocode Override','Link']]
	geoDF['lat'],geoDF['long'],_ = shootings['Geocode Override'].str.replace('(','').str.replace(')','').str.split(',').str
	geoDF['isFatal']=geoDF['UCR'].apply(isFatal)

	#time
	geoDF['Time']=geoDF['Time'].replace(np.nan,'') #replacing empty NaN values with empty strings
	geoDF['Hour']=geoDF['Time'].apply(date_to_t)
	geoDF['Hour HH'] = [m.hour if m!='' else -1 for m in geoDF['Hour']]
	geoDF['Minutes MM'] = [m.minute if m!='' else -1 for m in geoDF['Hour']]
	geoDF['ID'] = np.arange(0,len(geoDF),1)
	geoDF.columns = ['DATE','SEX','UCR','AGE','TIME', 'LOCATION','GEOCODE_OVERRIDE','LINK','LAT','LNG','IS_FATAL','HOUR','HOUR_HH','MINUTES_MM','ID']

	#The output path already has ".csv" in it, so let's remove it before appending the geocode extentsion
	geocode_output_path = outputPath.replace('.csv', '')

	#geocode data to csv
	geoDF.to_csv(geocode_output_path + '_geocode.csv',index=False)

	#cum sum to csv
	output.to_csv(outputPath,index=False)

