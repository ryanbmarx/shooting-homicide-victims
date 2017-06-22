
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


'''
I tend to find that type "date and time" provides programmers with an object oriented accessability
to days, month, and year of a date and time object. That's the main reason why I use it here.
'''
from datetime import datetime
shootings['Date']=shootings['Date'].replace(np.nan,'') #replacing empty NaN values with empty strings
def crap_to_dt(d):
    if(d==''):
        return (d)
    else:
        return (datetime.strptime(str(d) ,'%Y-%m-%d').date()) #converting dates from type string to type date and time
    
shootings['Date']=shootings['Date'].apply(crap_to_dt)
shootings['Date']= pd.to_datetime(shootings['Date'],errors='coerce') #apply pandas date and time function for future indexing




shootings = shootings[shootings['Date'].dt.year>2011] #pulling all the data from 2012 onwards.



geoDF = shootings[['Date','Shooting Location','Geocode Override','Link']]
'''
Although this is weird, but empty cells need to be replaced and filled by another value. In this case it's "Foo" (without quotations)
This step is necessary as some entries in the shootings file have no geo-code.
'''
geoDF['Geocode Override']=geoDF['Geocode Override'].replace(np.nan,'FOO')

long = []
lat = []

def cleanGeo (geocode):
    if(str(geocode).startswith('(')):
        lat_x,long_y = str(geocode).replace('(','').replace(')','').split(',')
        lat.append(lat_x)
        long.append(long_y)
    else:
        long.append('')
        lat.append('')
geoDF['Geocode Override'].apply(cleanGeo)

'''
Checking if lat and long have the same length. This makes sense, because geo-code data always come in pairs.

print (len(lat))
print (len(long))
'''

'''
adding the cleaned latitude (lat) and longtitude (long) values to a new data frame called geoDF.
'''
geoDF['lat'] = lat
geoDF['long'] = long

geoDF.to_csv(outputPath)




