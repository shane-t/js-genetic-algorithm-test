//yes

var config = {};

self.addEventListener("message", function (e) {
    if (e.data.type == "set_solution") {

        setup(e.data.value);

    } else if (e.data.type == "start") {

        main();

    } else {

        postMessage({type: "error", value: "unknown_type"});
    }
});


function setup( solution ) {
    config.solution = solution;
    config.length   = solution.length;
}

function main () {
    var myPop = new Population(64, true),
        generationCount = 0;

    FitnessCalc.setSolution(config.solution);

    while(FitnessCalc.getFitness(myPop.getFittest()) < FitnessCalc.getMaxFitness()){ 
        generationCount++; 

        //send a log message

        postMessage({ type: "generation", value: generationCount });
        postMessage({ type: "genetics", value: myPop.getFittest().getGenes() });

        myPop = Algorithm.evolvePopulation(myPop);
    }

    postMessage({type: "complete", value: myPop.getFittest().getGenes() });

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

    solution: null,

    setSolution: function (newSolution) {
        var solution = [];
        this.solution = util.getBlankArray(newSolution.length);
        
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
