const fetch = require("node-fetch");
const InputDataDecoder = require("ethereum-input-data-decoder");
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');

const defiSwapContract = '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3';

const abi = JSON.parse(fs.readFileSync('./defi-swap-abi.json').toString());

const startBlock = 11102289
const endBlock = 11502289

const getGasPrices = async () => {
	const decoder = new InputDataDecoder(abi);

	const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${defiSwapContract}&startblock=${startBlock}&endblock=${endBlock}&sort=asc`;

	const res = await fetch(url);

	if (res.ok) {
		const data = await res.json();

		if (!data.result) {
			console.log(data.result)
    }

		const nonErrorData = data.result
			.filter(({ isError }) => isError === "0")
			.map(eachData => {
				const decodedInput = decoder.decodeData(eachData.input);

				return {
					gasUsed: Number(eachData.gasUsed),
          method: decodedInput.method,
          inputs: decodedInput.inputs
				};
      });
      
    const csv = new ObjectsToCsv(nonErrorData);

    // Save to file:
    await csv.toDisk('./data.csv');

    console.log(nonErrorData);
	} else {
		throw new Error(`HTTP Call Failed`);
	}
};

getGasPrices();