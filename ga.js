var solution_text = "Hello machine, this is dog. Hi dog, machine here.",
    config        = { length: text2bin(solution_text).length },
    worker        = new Worker('worker.js');


function Blotter (canvas) {

    var generation  = 0,
        context     = canvas.getContext('2d'),
        height      = 2,
        width       = 2;

    function setwidth(number) {
        canvas.width = number * width;
    }

    function rewind () {
        generation = 0;
    }

    function blot (genes) {

        for (var i = 0; i < genes.length; i++) {
            context.fillStyle = genes[i] ? "black" : "white";
            context.fillRect(i*width,generation*height,width,height);
        }
        generation++;
    }

    return {
        blot:       blot,
        setwidth:   setwidth,
        rewind:     rewind
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

function setup (solution_text) {

    var blotter  = Blotter(document.getElementById('gel')),
        solution = text2bin(solution_text);

    blotter.setwidth(solution.length);

    if (!config.listener_added) {
        worker.addEventListener("message", function (msg) {
            var data = msg.data,
                str  = "";

            if (data.type == "generation") {
                //console.log("generation" + data.value)
            } else if (data.type == "genetics") {

                //for (var i = 0; i < data.value.length; i++) {
                //    str += data.value[i];
                //}
                //console.log(str);

                blotter.blot(data.value);
            } else if (data.type == "complete") {
                blotter.rewind();
            }
        });
        config.listener_added = true;
    }

    worker.postMessage({ type: "set_solution", value: solution });
}


function start () {
    worker.postMessage({type:"start", value: "" });
}

function interact() {
    setup(prompt("solution?"));
    start();
}
