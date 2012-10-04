function Blot (individual) {
    var html = "";
    html += "<li>";
    for (var i = 0; i < individual.genes.length; i++) {
        html += individual.genes[i];
    }
    html += "</li>";
    $('#pcr').append(html);
}

function Population (size, initialise) {

    this.individuals = this.getBlankIndividuals(size);

    if (initialise) {
        for (var i = 0; i < size; i++) {
            individual = new Individual();
            individual.generateIndividual()
            this.individuals[i] = individual;
        }
    }
}

Population.prototype = {
    individuals: null,

    getBlankIndividuals: function (size) {
        var newArray = [];
        for (var i = 0; i < size; i++) {
            newArray.push(new Individual());
        }
        return newArray;
    },
    
    getIndividual: function (i) {
        return this.individuals[i];
    },

    getFittest: function () {
        var fittest = this.individuals[0];

        for (var i = 0; i < this.size(); i ++) {
            if (fittest.getFitness() <= this.getIndividual(i).getFitness()) {
                fittest = this.getIndividual(i);
            }
        }

        return fittest;
    },

    size: function () {
        return this.individuals.length;
    },

    saveIndividual: function (index, indiv) {
        this.individuals[index] = indiv;
    }

}

function Individual() { 
   this.defaultGeneLength = 64;
   
   this.genes = this.generateBlankIndividual();

   this.fitness = 0;
}

Individual.prototype = {
    defaultGeneLength: null,
    genes: null,

    generateBlankIndividual: function () {
        newArray = [];
        for (var i = 0; i < this.defaultGeneLength; i++) {
            newArray.push(0);
        }
        return newArray;
    },

    generateIndividual: function () {
        for (var i = 0; i < this.size(); i++) {
            var gene = Math.round(Math.random());
            this.genes[i] = gene;
        }
    },

    setDefaultGeneLength: function (length) {
        this.defaultGeneLength = length;
    },

    getGene: function (index) {
        return this.genes[index];
    },

    setGene: function (index, value) {
        this.genes[index] = value;
        this.fitness = 0;
    },

    size: function() {
        return this.genes.length;
    },

    getFitness: function () {
        return FitnessCalc.getFitness(this);
    },

    toString: function () {
        var geneString = "";
        for (var i = 0; i < this.size(); i ++) {
            geneString += this.getGene(i);
        }
        return geneString;
    }
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



    solution: util.getBlankArray(64),


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
        var fitness = 0;

        for (var i = 0; i < individual.size() && i < this.solution.length; i++) {
        if (individual.getGene(i) == parseInt(this.solution[i])) {
                fitness++;
            }
        }
        return fitness;
    },

    getMaxFitness: function () {
        var maxFitness = this.solution.length;
        return maxFitness;
    }
}

function main () {
    FitnessCalc.setSolution("1111000000000000000000000000000000000000000000000000000000001111");    
    var myPop = new Population(64, true);
    var generationCount = 0;
    while(myPop.getFittest().getFitness() < FitnessCalc.getMaxFitness()){ 
        generationCount++; 
        console.log("Generation: "+generationCount+" Fittest: "+myPop.getFittest().getFitness()); 
        myPop = Algorithm.evolvePopulation(myPop);
    }
    console.log("Solution found!");
    console.log("Generation: " + generationCount);
    console.log("Genes:");
    var genestring = "";
    for (var i = 0; i < myPop.getFittest().genes.length; i++) {
        genestring +=  myPop.getFittest().genes[i];
    }
    console.log(genestring);
}

//node.js
if (typeof window == "undefined") {
    main();
}
