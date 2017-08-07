#get pandas and numpy
import pandas as pd
import numpy as np
import io
import requests
from datetime import datetime as dt
import warnings
import shootings_analysis_script
import homicides_analysis_script
warnings.filterwarnings("ignore")
#######
#Getting system arguments:
import sys
#######
outputPath = ""

# if user passes input and output file paths along with the type of data
# to be analyzed (i.e., shootings vs homicide), then do the following:
# Note: python name_of_script -i input_file output_file h
# name_of_script: argument 1
# -i : notify python that we are reading user info argument 2
# input_file: argument 3
# output_file: argument 4
# h: argument 5 (s: shootings; h: homicides)

if(len(sys.argv)==5):

	#print (len(sys.argv))
	#e.g:python script_name.py -i input.csv output.csv h

	input_file=pd.read_csv(sys.argv[2]) #reading input file name
	output_file=sys.argv[3] #setting the output file name
	data_type = sys.argv[4] #notifying the script if the input_file is shootings vs. homicide data
	if(data_type.lower()=='s'):
		shootings_analysis_script.get_shootings(input_file,output_file)
	if(data_type.lower()=='h'):
		homicides_analysis_script.get_homicides(input_file,output_file)
else:
	#e.g, python shootings_script.py ./data/raw-data.csv s
	#note: for the webcrawler option, you don't need to add -i before the ouptu file name
	output_file=sys.argv[1] #second parameter after the script name
	data_type = sys.argv[2] #notifying the script if the input_file is shootings vs. homicide data
	#print (data_type)
	if(data_type.lower()=='s'):
		url="http://newsroomdb.tribapps.com/table/csv/shootings"
		urlRequest=requests.get(url).content
		input_file=pd.read_csv(io.StringIO(urlRequest.decode('utf-8')))
		shootings_analysis_script.get_shootings(input_file,output_file)
	if(data_type.lower()=='h'):
		url = "http://newsroomdb.tribapps.com/table/csv/homicides"
		urlRequest=requests.get(url).content
		input_file=pd.read_csv(io.StringIO(urlRequest.decode('utf-8')))
		homicides_analysis_script.get_homicides(input_file,output_file)

