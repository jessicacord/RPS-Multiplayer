// Initialize Firebase
var config = {
    apiKey: "AIzaSyDPQJbXUJz_DHjh5oPrl2Zk_r5aEN9jT2c",
    authDomain: "rps-multiplayer-2f9d8.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-2f9d8.firebaseio.com",
    projectId: "rps-multiplayer-2f9d8",
    storageBucket: "",
    messagingSenderId: "619097739203"
  };

firebase.initializeApp(config);

var database = firebase.database();
var player1 = null;
var player2 = null;
var turn = null;





//Capture name of new player and create player object storing name, wins, losses
$("#submit").on("click", function() {

        event.preventDefault();

        if ( player1 === null) {
            
            var newPlayerName = $("#player-name").val().trim();
            player1 = {
                name: newPlayerName,
                wins: 0,
                losses: 0,
                turn: false,
                choice: ""
            }
            
            database.ref("/players/player1").set(player1);

            

            $("#name-input").html("Welcome " + player1.name);

            $("#player-1-box").append($("<h4>").attr("id","player1-choice"));

            $("#player-2-box").append($("<h4>").attr("id","player1-opp-choice"));

            $("#chat-form").append($("<input>").attr("type", "hidden").attr("value", player1.name).addClass("player-message"));

            
            

            //Delete player when user closes tab
            database.ref("/players/player1").onDisconnect().remove();
            database.ref("/turn").onDisconnect().remove();
            database.ref("/message/").onDisconnect().set(player1.name + " has disconnected");
            
    
        } else if ( player2 === null) {

            var newPlayerName = $("#player-name").val().trim();
            player2 = {
                name: newPlayerName,
                wins: 0,
                losses: 0,
                turn: false,
                choice: ""
            }
            $("#name-input").html("Welcome " + player2.name);
            
            $("#player-2-box").append($("<h4>").attr("id","player2-choice"));

            $("#player-1-box").append($("<h4>").attr("id","player2-opp-choice"));
            
            $("#chat-form").append($("<input>").attr("type", "hidden").attr("value", player2.name).addClass("player-message"));
            
            database.ref("/players/player2").set(player2);


            

            //Delete player when user closes tab
            database.ref("/players/player2").onDisconnect().remove();
            database.ref("/turn").onDisconnect().remove();
            database.ref("/message/").onDisconnect().set(player2.name + " has disconnected");

        } else if ( player1 !== null && player2 !== null) {
            alert("The game is currently full. Try again later");
        }

        if ( player1 !== null && player2 !== null) {
            database.ref("/turn").set(1);
            database.ref("/message").set("");
        }
    
})


//Listen for Player changes in firebase
database.ref("/players/").on("value", function(snap) {
    
    
    if ( snap.child("player1").exists()){
        player1 = snap.child("player1").val();
    } else {
        player1 = null;
    }
    
    
    if ( snap.child("player2").exists()){
        player2 = snap.child("player2").val();
    } else {
        player2 = null;
    }


    if ( player1 !== null ) {
        $("#player-1-name").text(player1.name);
        
    } else {
        $("#player-1-name").text("");
        $("#player1-scores").text("");
        $("#player1-choice").html("");
    }

    if ( player2 !== null ) {
        $("#player-2-name").text(player2.name);
        

    } else {
        $("#player-2-name").text("");
        $("#player2-scores").text("");
        $("#player1-choice").html("");
    }

    if ( player1 && player2 ) {
        $("#player1-scores").text("Wins: " + player1.wins + " Losses: " + player1.losses);
       
        $("#player2-scores").text("Wins: " + player2.wins + " Losses: " + player2.losses);
       
    }
    
})

//Listen for turn changes in firebase
database.ref("/turn").on("value", function(snap){

    turn = snap.val();
    console.log("The turn is " + turn);
    //Prompt player 1 to choose rock, paper, or scissors
    if ( turn === 1 ) {

        database.ref("/players/player1/turn").set(true);

        
        var rock = $("<div>").html($("<a>").attr("class", "rps").attr("data-rps", "rock").text("Rock"));
        var paper = $("<div>").html($("<a>").attr("class", "rps").attr("data-rps", "paper").text("Paper"));
        var scissors = $("<div>").html($("<a>").attr("class", "rps").attr("data-rps", "scissors").text("Scissors"));

        $("#player1-choice").html(rock).append(paper).append(scissors);
        $("#player2-choice").html("");
        
        $("#player1-opp-choice").html("");
        $("#player2-opp-choice").html("");
        
    }

    //Prompt player 2 to choose rock, paper, or scissors
    else if ( turn === 2 ) {
        database.ref("/players/player2/turn").set(true);

        var rock = $("<div>").html($("<a>").attr("class", "rps").attr("data-rps", "rock").text("Rock"));
        var paper = $("<div>").html($("<a>").attr("class", "rps").attr("data-rps", "paper").text("Paper"));
        var scissors = $("<div>").html($("<a>").attr("class", "rps").attr("data-rps", "scissors").text("Scissors"));

        $("#player2-choice").html(rock).append(paper).append(scissors);
        
        
    } 

    $(".rps").on("click", function() {
    
        if ( turn === 1 ) {
            player1.choice = $(this).attr("data-rps");
            player1.turn = false;

            $("#player1-choice").html(player1.choice);

            database.ref("/players/player1").set(player1);
            database.ref("/turn").set(2);
            console.log("Player 1 just picked " + player1.choice);
            
        } else if ( turn === 2 ) {
            player2.choice = $(this).attr("data-rps");
            player2.turn = false;

            $("#player2-choice").html(player2.choice);

            database.ref("/players/player2").set(player2);
            console.log("Player 2 just picked " + player2.choice);
            database.ref("/turn").set(3);

            
            
        }
    })

    //Show choices of each player, determine winner, increase win/loss count
    if ( turn === 3 ) {
        winner();
        $("#player1-opp-choice").html(player2.choice);
        $("#player2-opp-choice").html(player1.choice);

         
        setTimeout(reset, 4000);

        
    }
    
})


//Determine winner
var winner = function() {

    if ( player1.choice === "rock" ) {
        if ( player2.choice === "rock" ) {
            $("#result-box").html("Tie");
            console.log("Tie");
        } else if ( player2.choice === "paper" ) {
            $("#result-box").html(player2.name + " won");
            console.log("Player 2 won");
            player1.losses += 1;
            player2.wins += 1;
        } else if ( player2.choice === "scissors" ) {
            $("#result-box").html(player1.name + " won");
            console.log("Player 1 won");
            player1.wins += 1;
            player2.losses += 1;
        }
    } else if ( player1.choice === "paper" ) {
        if ( player2.choice === "paper" ) {
            $("#result-box").html("Tie");
            console.log("Tie");
        } else if ( player2.choice === "scissors" ) {
            $("#result-box").html(player2.name + " won");
            console.log("Player 2 won");
            player1.losses += 1;
            player2.wins += 1;
        } else if ( player2.choice === "rock" ) {
            $("#result-box").html(player1.name + " won");
            console.log("Player 1 won");
            player1.wins += 1;
            player2.losses += 1;
        }
    } else if ( player1.choice === "scissors" ) {
        if ( player2.choice === "scissors" ) {
            $("#result-box").html("Tie");
            console.log("Tie");
        } else if ( player2.choice === "rock" ) {
            $("#result-box").html(player2.name + " won");
            console.log("Player 2 won");
            player1.losses += 1;
            player2.wins += 1;
        } else if ( player2.choice === "paper" ) {
            $("#result-box").html(player1.name + " won");
            console.log("Player 1 won");
            player1.wins += 1;
            player2.losses += 1;
        }
    }

    database.ref("/players/").set({
        player1: player1,
        player2: player2
    });
    
}

var reset = function() {
    
    player1.choice = "";
    
    player2.choice = "";
    

    database.ref("/players/").set({
        player1: player1,
        player2: player2
    });
    database.ref("/turn").set(1);
    

}


//Messages listener
database.ref("/message/").on("value", function(snap){
    
    $("#chat-box").append($("<p>").text(snap.val()));
})





//Create chat functionality
//Take users message input and displays in chat screen with player name and message

$("#send-chat").on("click", function() {
    
    event.preventDefault();

    if (player1 && player2){
        var message = $("#chat-message").val();
        var playerMessage = $(".player-message").val();
        
        database.ref("/message/").set(playerMessage + ": " + message);
    }

    $("#chat-message").val("");
    database.ref("/message/").set("");
    
})