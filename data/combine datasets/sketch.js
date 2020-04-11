function preload() {
	incidents = loadTable('../ibc-incidents-2020-3-29-modified.csv', 'csv', 'header');
	individuals = loadTable('../ibc-individuals-2020-3-29-modified.csv', 'csv', 'header');
}

function setup() {
	noCanvas()
	
	totalIncidents = incidents.getRowCount()
	print("total incidents = " + totalIncidents)
	print("total deaths (minimum) = " + countTotalOfAllCellsInColumn(incidents, "Reported Minimum"))
	print("total deaths (maximum) = " + countTotalOfAllCellsInColumn(incidents, "Reported Maximum"))
	totalIndividuals = individuals.getRowCount()
	print("total identified = " + totalIndividuals)

	data = {"incidents":[]}

	for(i = 0 ; i < incidents.getRowCount() ; ++i) {
		// show progress (on console)
		if(i%1000==0 || i==(incidents.getRowCount()-1)) { 
			print( "preparing data: " + parseInt(100*((i+1)/incidents.getRowCount())) + "% done." ) 
		}

		incidentCode = incidents.get(i, 'IBC code')
		names = [] // we willplace json objects of each individual in here
		for(j = 0 ; j < individuals.getRowCount() ; ++j) {
			civilianCode = individuals.get(j, 'IBC code')
			if(civilianCode.startsWith(incidentCode) && civilianCode[incidentCode.length]==='-') { // i.e., we found an individual who'd been killed in that incident
				name = individuals.get(j,'Name or Identifying Details')
				age = individuals.get(j,'Age')
				if(age === "unknown") age = ""
				names.push(
					{
						"n": name, 
						"a": age
					}
				)
			}
		}

		data.incidents.push(
			{
				'i' : incidentCode,
				'd' : incidents.get(i, 'End Date'),
				'l' : incidents.get(i, 'Location'),
				't' : incidents.get(i, 'Target'),
				'k' : incidents.get(i, 'Reported Minimum'),
				'K' : incidents.get(i, 'Reported Maximum'),
				'n' : names
			}
		)
	}

	/* 
		to load the JSON object:
		»	data = loadJSON('data/combined-dataset.json')
		
		count total items (keys) in this JSON object: 
		»	Object.keys(data).length
		
		to access the data:
		»	LEN = Object.keys(data).length
			for( let k = 0 ; k < LEN ; ++k ) {
				print(`max civilians killed = ${data[k]['max killed']}`)
			}

	*/

	// print to console, to check if the data loaded correctly.
	// print(incidents)
	// print(incidents.getArray())

	// export prepared dataset 
	saveJSON(data, 'combined-dataset')

	createP("done! &mdash; data file should download now!").parent('#status')

}

function draw() {
}

/* other helper functions */

function countTotalOfAllCellsInColumn(dataset, columnID) {
	total = 0
	arr = dataset.getColumn(columnID)
	for (let i = 0 ; i < arr.length ; ++i) { 
		total += parseInt(arr[i]) 
	}
	return total;
}