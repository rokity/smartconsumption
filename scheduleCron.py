#this script create a schedule on crontab

from crontab import CronTab


my_cron = CronTab(user='riccardo')

for job in my_cron:
    print job

job = my_cron.new(command='python ~/Desktop/smartconsuption/writeDate.py')

job.minute.every(1)

my_cron.write()

for job in my_cron:
    print job
