import csv, re

def sanitize(name):
    name = re.sub('\\d+', '', name.upper().replace(' ', ''))
    name = name.replace('Ñ','N').replace('Ó','O').replace('Í', 'I')
    name = name.replace('CANTON', '').replace('CASERIO', '').replace('COLONIA', '')
    name = name.replace('ABAJO', '')

    if name[:3] == 'LAS' or name[:3] == 'LOS':
        name = name[3:]
    elif name[:2] == 'EL' or name[:2] == 'LA':
        name = name[2:]
    return name

def geocode_crimes(places, crimes, csvwrite):
    mi = 0
    missing = 0

    # ['CUENTA', 'DELITO', 'FECHA HECHO', 'HORA HECHO',
    #     'DEPARTAMENTO HECHO', 'MUNICIPIO HECHO', 'CANTON HECHO',
    #     'CASERIO HECHO', 'COMPLEMENTO HECHO', 'AREA', 'TIPO DE  ARMA',
    #     'SEXO VICTIMA', 'EDAD VICTIMA', 'OCUPACION', 'lng', 'lat'])

    for crime in crimes:
        mi += 1
        if mi == 1:
            crime.append('lng')
            crime.append('lat')
            csvwrite.writerow(crime)
            if 'DEPARTAMENTO HECHO' in crime:
                dept_index = crime.index('DEPARTAMENTO HECHO')
            elif 'DEPARTAMENTO' in crime:
                dept_index = crime.index('DEPARTAMENTO')
            elif 'DEPTO' in crime:
                dept_index = crime.index('DEPTO')
            else:
                print(crime)
            if 'MUNICIPIO HECHO' in crime:
                muni_index = crime.index('MUNICIPIO HECHO')
            else:
                muni_index = crime.index('MUNICIPIO')
            if 'CANTON HECHO' in crime:
                cant_index = crime.index('CANTON HECHO')
            elif 'CANTON  HECHO' in crime:
                cant_index = crime.index('CANTON  HECHO')
            else:
                cant_index = crime.index('CANTON')
            if 'CASERIO HECHO' in crime:
                case_index = crime.index('CASERIO HECHO')
            elif 'CASERIO' in crime:
                case_index = crime.index('CASERIO')
            else:
                case_index = -1
        else:
            dept = crime[dept_index]
            muni = crime[muni_index]
            canton = crime[cant_index]
            caserio = crime[case_index]
            #comp = crime[8] = verbal description (i.e. bus station)
            #area = crime[9] = urban / rural
            #print(dept + ' and ' + muni)

            ni = 0
            relevant_places = []
            potential_places = []
            found_dept = False
            last_message = ''
            for place in places:
                # [Lng, Lat, 'CODIGO DEP', 'DEPARTAMENTO', 'CODIGO MUN',
                # 'COD_MUN2', 'Municipio', 'NOMBRE', 'Tipo_Terr']
                ni += 1
                if ni > 1:
                    if place[0].strip() == '' or place[1].strip() == '':
                        continue
                    if sanitize(place[3]) == sanitize(dept):
                        found_dept = True
                        if sanitize(place[6]) == sanitize(muni):
                            if sanitize(canton) != '':
                                # canton is from the crime
                                # check against the neighborhood
                                if sanitize(canton) == sanitize(place[7]):
                                    # print('success canton')
                                    # print(canton + 'vs ' + place[7])
                                    relevant_places.append([place[0], place[1]])
                                elif sanitize(canton) in sanitize(place[7]):
                                    potential_places.append([place[0], place[1]])
                            elif sanitize(caserio) != '':
                                if sanitize(caserio) == sanitize(place[7]):
                                    # print('success caserio')
                                    # print(caserio + 'vs ' + place[7])
                                    relevant_places.append([place[0], place[1]])
                                elif sanitize(canton) in sanitize(place[7]):
                                    potential_places.append([place[0], place[1]])
                                # else:
                                #     print(caserio + 'vs ' + place[7])
                            else:
                                # dept/muni is best detail for now
                                relevant_places.append([place[0], place[1]])
            last_message = ''
            # print(dept + ' ' + muni + ' ' + canton + ' ' + caserio)
            # print(relevant_places)
            # if not found_dept:
            #     print(crime)
            #     print('had no dept')
            #     quit()
            if len(relevant_places) == 0:
                relevant_places = potential_places
            if len(relevant_places) == 0:
                print('none found for ' + dept + ' / ' + muni + ' / (' + caserio + ' || ' + canton + ')')
                missing += 1
                #quit()
            elif len(relevant_places) == 1:
                crime.append(relevant_places[0][0])
                crime.append(relevant_places[0][1])
                csvwrite.writerow(crime)
                print('one fit')
                #print(relevant_places[0])
            else:
                lng = 0.0
                lat = 0.0
                for rp in relevant_places:
                    lng += float(rp[0])
                    lat += float(rp[1])
                lat /= len(relevant_places)
                lng /= len(relevant_places)
                crime.append(lng)
                crime.append(lat)
                csvwrite.writerow(crime)
                print('avg fit')
                # print([lng, lat])


            #print(','.join([dept, muni, canton, caserio]))
    print(str(missing) + ' / ' + str(mi))

neighborhoods = []
with open('Neighborhood_points.csv') as places_csv:
    for place in csv.reader(places_csv, delimiter=','):
        neighborhoods.append(place)

    for year in [2010, 2011, 2014, 2015]:
        year = str(year)
        for crime in ['HURTOS', 'ROBOS', 'HOMICIDIOS', 'EXTORSIONES']:
            print(year + ' / ' + crime)
            if year == '2015' and (crime == 'HURTOS' or crime == 'ROBOS'):
                continue
            with open('/Users/ndoiron404/Downloads/elsal/EFICACIA ' + year + '/' + crime + ' ' + year + '-Table 1.csv') as crimes_csv:
                crimes = csv.reader(crimes_csv, delimiter=',')
                opcsv = open('geocoded_' + crime.lower() + '_' + year + '.csv', 'w')
                geocode_crimes(neighborhoods, crimes, csv.writer(opcsv, delimiter=',', quoting=csv.QUOTE_MINIMAL))
                opcsv.close()
