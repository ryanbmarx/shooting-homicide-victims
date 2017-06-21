
# <center> Documenting Python Dynamic Script </center>

The purpose of **shootings_script_Dynamic.py** is to provide a dynamic way of gathering, cleaning, and analyzing shootings data available on newsroomDB. Next, I'll describe how the script works.

The python script crawls NewsroomDB and gets the most up-to-date version of the shootings data that is available on the website. Next, it cleans the Date column so that the formating becomes more python friendly. Next, it calculates the cumulative sum of the number of shootings for each day in each month of ever year. The calcuation will be output in a csv file format and it's called **number_of_shootings_up_to_DATE** (e.g., number_of_shootings_up_to_26/07/2017).
 

### How to run the script

Ryan Marx will be implementing a node js code that uses command line to call and access the python script.

I have written the script in a way so that anyone who is running it will have the freedom to choose the path where the CSV file mentioned above needs to be saved to.

The following is an example of the python command:

```
python shootings_script_Dynamic.py PATH_TO_YOUR_DIRECTORY


python shootings_script_Dynamic.py shootings/data (this is just an example of how your path should look like)

```

