from BeautifulSoup import BeautifulSoup
import json
import urllib2

# get code from expedia
url= 'http://www.expedia.com/daily/airports/AirportCodes.asp'
file = "international.html"

'''
    Get the following format
    [
        {'code', 'city', 'country'}

    ]

'''
def extractCode2():
    url = "https://www.world-airport-codes.com/alphabetical/airport-code/t.html"
    response = urllib2.urlopen('http://python.org/')
    data = open("world-airport-code.html","r").read()
    soup = BeautifulSoup(data)


    tables = soup.find("div", {"class": "box-main"}).find("table").findAll("tbody")


    result = []
    for table in tables:
        rows = table.findAll("tr")
        for row in rows:
            cells = row.findAll("td")
            if len(cells) < 4:
                continue

            name = row.find("th").find("a")


            result.append({
                'name': name.getText(),
                'city' : cells[0].getText(),
                'country' : cells[1].getText(),
                'code'  : cells[2].getText()
            })
    return len(result)

def extractCode():
    data = open(file,"r").read()
    soup = BeautifulSoup(data)

    tables = soup.find("div", {"class":"AirportCode"}).findAll("table")#.find("tbody").find_all("tr")

    result = []
    for table in tables:
        rows = table.find("tbody").findAll("tr")
        for row in rows:
            cells = row.findAll("td")
            result.append({
                'city' : cells[0].getText(),
                'country' : cells[1].getText(),
                'code'  : cells[2].getText()
            })
    return result

if __name__ == '__main__':
    print extractCode2()

    '''
    result = extractCode()
    with open('international_airport.json', 'w') as outfile:
        json.dump(result, outfile)
    '''
