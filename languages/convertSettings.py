import os, sys, json
from genericpath import isfile

SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
settings = 'swiperSettings-'
path = os.path.join(SCRIPT_DIR, settings + 'en_EN.json')
data = {}
newdata = {}

removeTopLevel = ['pre', 'options', 'sanitizer', 'section', 'namespace']
removeParams = ['accept', 'label', 'class', 'custom_data', 'type', 'required', 'step', 'default', 'shortcode', 'min', 'max']

if isfile(path):
    f = open( path )
    data = json.load(f)
    f.close()

for x in data:
  #print(x)
  if x not in removeTopLevel:
    #del data[x]
    if 'param' in x:
        subdict = data[x]
        newsubdict = {}
        
        for xx in subdict:
            if xx not in removeParams:
                if xx == 'values' and type(subdict[xx]) == dict:
                    newsubdict[xx] = subdict[xx]
                elif xx == 'values':
                    a=0
                else:
                    newsubdict[xx] = subdict[xx]
                
        newdata[x] = newsubdict
        
    else:
        newdata[x] = data[x]

# write newdata to json file
path = os.path.join(SCRIPT_DIR, settings + 'xx_XX.json')
f = open( path, 'w' )
json.dump(newdata, f)
f.close()

print('ready')

