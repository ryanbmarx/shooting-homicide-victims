#get pandas and numpy
import pandas as pd
import numpy as np
import io
import requests
from datetime import datetime as dt
#######
#Getting system arguments:
import sys
#######

outputPath = ""

if(len(sys.argv)==4):
	#e.g, python shootings_script.py -i newsroomdb.com/data.csv ./data/raw-data.csv
	shootings=pd.read_csv(sys.argv[2]) #reading input file name
	shootings.head(3)
	outputPath=sys.argv[3] #output file is the 4th argument. python keyword doesn't count.
else:
	#e.g, python shootings_script.py ./data/raw-data.csv
	url="http://newsroomdb.tribapps.com/table/csv/shootings"
	urlRequest=requests.get(url).content
	shootings=pd.read_csv(io.StringIO(urlRequest.decode('utf-8')))
	shootings.head(3)
	outputPath=sys.argv[1] #second parameter after the script name



shootings['Date'].head(3)

'''
Change the formating of date from MM/DD/YY to MM-DD-YY.. python loves it this way!
'''

from datetime import datetime
shootings['Date']=shootings['Date'].replace(np.nan,'') #replacing empty NaN values with empty strings
def crap_to_dt(x):
    if(x==''):
        return (x)
    else:
        return (datetime.strptime(str(x) ,'%Y-%m-%d').date()) #converting dates from type string to type date and time
    
shootings['Date']=shootings['Date'].apply(crap_to_dt)

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


output.index.names=['ID']
output.reset_index()

#outputs a csv file with todays date in the file name. This will help in tracking the updates.
#output.to_csv(str(sys.argv[1])+'/number_of_shootings_up_to_'+str(dt.today().strftime("%m_%d_%Y"))+'.csv')

output.to_csv(outputPath)




#This is now working properly! It wrties .csv file to a specific folder/directory
