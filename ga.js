var solution_text = "Hello machine, this is dog. Hi dog, machine here.",
    config        = { length: text2bin(solution_text).length };

function Blotter (canvas) {

    var generation = 0,
        context = canvas.getContext('2d'),
        height = 2,
        width = 2;

    function setwidth(number) {
        canvas.width = number * width;
    }

    function blot (individual) {
        var genes = individual.getGenes();

        for (var i = 0; i < genes.length; i++) {
            context.fillStyle = genes[i] ? "black" : "white";
            context.fillRect(i*width,generation*height,width,height);
        }
        generation++;
    }

    return {
        blot: blot,
        setwidth: setwidth
    }
}


function Population (sizeto, initialise) {

    var individuals = getBlankIndividuals(sizeto),
        fittest_cache = null;

    if (initialise) {
        for (var i = 0; i < sizeto; i++) {
            individual = new Individual();
            individual.generateIndividual()
            individuals[i] = individual;
        }
    }

    function getBlankIndividuals(size) {
        var newArray = [], i;
        for (i = 0; i < size; i++) {
            newArray.push(new Individual());
        }
        return newArray;
    }

    function getIndividual (index) {
        return individuals[index];
    }

    function getFittest () {
        var fittest = individuals[0];

        if (fittest_cache != null) {
            return fittest_cache;
        }

        for (var i = 0; i < individuals.length; i ++) {
            if (FitnessCalc.getFitness(fittest) <= FitnessCalc.getFitness(individuals[i])) {
                fittest = individuals[i];
            }
        }

        fittest_cache = fittest;

        return fittest;
    }

    function size() {
        return individuals.length;
    }

    function saveIndividual (index, indiv) {
        individuals[index] = indiv;
    }

    return {
        getFittest      : getFittest,
        getIndividual   : getIndividual,
        size            : size,
        saveIndividual  : saveIndividual
    };

}

function Individual(defaultGeneLength) { 

    if (typeof defaultGeneLength == "undefined") {
        defaultGeneLength = config.length;
    }

    var genes = generateBlankIndividual(),
        fitnessCache = -1;


    function generateBlankIndividual () {
        newArray = [];
        for (var i = 0; i < defaultGeneLength; i++) {
            newArray.push(0);
        }
        return newArray;
    }

    function generateIndividual () {
        var gene;

        for (var i = 0; i < genes.length; i++) {
            gene = Math.round(Math.random());
            genes[i] = gene;
        }
    }

    function getGene (index) {
        return genes[index];
    }

    function getGenes() {
        return genes;
    }

    function setGene (index, value) {
        genes[index] = value;
        fitnesscache = 0;
    }

    function size () {
        return genes.length;
    }

    function toString () {
        var geneString = "";
        for (var i = 0; i < this.size(); i ++) {
            geneString += this.getGene(i);
        }
        return geneString;
    }

    function setFitnessCache (amount) {
        fitnessCache = amount;
    }

    function getFitnessCache() {
        return fitnessCache;
    }

    return {
        setFitnessCache     : setFitnessCache,
        getFitnessCache     : getFitnessCache,
        toString            : toString,
        size                : size,
        setGene             : setGene,
        generateIndividual  : generateIndividual,
        getGenes            : getGenes,
        getGene             : getGene
    };

}

var Algorithm = {
    uniformRate: 0.5,
    mutationRate: 0.015,
    tournamentSize: 5,
    elitism: true,

    evolvePopulation: function (pop) {
        newPopulation = new Population(pop.size(), false);
        
        
        if (this.elitism) {
            newPopulation.saveIndividual(0, pop.getFittest());
        }

        var elitismOffset;

        if (this.elitism) {
            elitismOffset = 1;
        } else {
            elitismOffet = 0;
        }

        //gimme tha hash


        //create individuals with crossover
        for (var i = elitismOffset; i < pop.size(); i++) {
            indiv1 = this.tournamentSelection(pop);
            indiv2 = this.tournamentSelection(pop);

            newIndiv = this.crossover(indiv1, indiv2);
            newPopulation.saveIndividual(i, newIndiv);
        }

        //mutate population
       
            //gimme tha hash

        for (var i = elitismOffset; i < newPopulation.size(); i++) {
            this.mutate(newPopulation.getIndividual(i));
        }

        return newPopulation;
    
    },

    crossover: function (indiv1, indiv2) {
        var newSol = new Individual();
        for (var i = 0; i < indiv1.size(); i++) {
            if (Math.random() <= this.uniformRate) {
                newSol.setGene(i, indiv1.getGene(i));
            } else {
                newSol.setGene(i, indiv2.getGene(i));
            }
        }
        return newSol;
    },

    mutate: function (indiv) {
        for (var i = 0; i < indiv.size(); i ++) {
            if (Math.random() <= this.mutationRate) {
                //create random gene
                var gene = Math.round(Math.random());
                indiv.setGene(i, gene);
            }
        }
    },

    tournamentSelection: function (pop) {
        tournament = new Population (this.tournamentSize, false);
        for (var i = 0; i < this.tournamentSize; i++) {
            var randomId = parseInt(Math.random() * pop.size());
            tournament.saveIndividual(i, pop.getIndividual(randomId));
        }

        var fittest = tournament.getFittest();

        return fittest;
    }
}

var util = {

    getBlankArray: function (len) {
        newArray = [];
        for (var i = 0; i < len; i++) {
            newArray.push(0);
        }
        return newArray;
    }
}

var FitnessCalc = {

    solution: util.getBlankArray(text2bin(solution_text).length),

    setSolution: function (newSolution) {
        solution = [];
        
        for (var i=0; i < newSolution.length; i++) {
            var character = newSolution.charAt(i);
            if (character == "0" || character == "1") {
                this.solution[i] = character;
            } else {
                this.solution[i] = 0;
            }
        }
    },

    getFitness: function (individual) {
        var fitnessCache = individual.getFitnessCache(),
            fitness = 0;

        if (individual.fitnessCache > -1) {
            fitness = fitnessCache;
        } else {

            for (var i = 0; i < individual.size() && i < this.solution.length; i++) {
            if (individual.getGene(i) == parseInt(this.solution[i])) {
                    fitness++;
                }
            }
            individual.setFitnessCache(fitness);

        }
        return fitness;
    },

    getMaxFitness: function () {
        var maxFitness = this.solution.length;
        return maxFitness;
    }
}
//http://stackoverflow.com/questions/8099078/error-converting-a-binary-number-to-ascii-text-with-js
function bin2text (text) {
    var output = ''
    for (var i = 0 ; i < text.length; i+= 8) {
        var c = 0;
        for (var j=0; j < 8 ; j++) {
            c <<= 1;
            c |= parseInt(text[i + j]); 
        }
        output += String.fromCharCode(c);
    }
    return output;
}

function text2bin (text) {

    var str = text.split('');
    var binaries = "";
    var binary = "";

    for (var i = 0; i < str.length; ++i){
        binary = str[i].charCodeAt(0).toString(2);
        while (binary.length < 8 ) {
            binary = "0" + binary;
        }
        binaries += binary;

    }
    return binaries;
}

    
//

function main (log) {

    var solution = text2bin(solution_text);

    FitnessCalc.setSolution(solution);

    var myPop = new Population(64, true);
    var generationCount = 0;
    var blotter = Blotter(document.getElementById('gel'));

    blotter.setwidth(text2bin(solution_text).length);

    while(FitnessCalc.getFitness(myPop.getFittest()) < FitnessCalc.getMaxFitness()){ 
        generationCount++; 

        if (log) {
            console.log("Generation: "+generationCount+" Fittest: "+FitnessCalc.getFitness(myPop.getFittest())); 
        }

        blotter.blot(myPop.getFittest());
        $('#progress').append(
            "<li>" + bin2text(myPop.getFittest().toString()) + "</li>"
        );
        myPop = Algorithm.evolvePopulation(myPop);
    }

    if (log) {
        console.log("Solution found!");
        console.log("Generation: " + generationCount);
        console.log("Genes:");
    }

}

//node.js
if (typeof window == "undefined") {
    main();
}
