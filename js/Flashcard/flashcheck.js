$(document).ready(function() {
/*	start = Date.now();*/

    $('#settingsNavbar').hide()
    $('#cardNavbar').hide()
    $('#statsNavbar').hide()
    $('#statsCompareNavbar').hide()    
    $('#browseNavbar').hide()    

    window.isphone = false;
    var ua = navigator.userAgent.toLowerCase();
    window.isphone = ua.indexOf("mobile") > -1 || ua.indexOf("android") > -1;

    if( window.isphone ) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
});

function onDeviceReady() {
/*	start = Date.now();*/
	
    var oldStats = []; // array to hold old stats for comparison
    var medStats = []; // array to hold old stats, which may or may not become new oldStats
    var selecteddecksets = [];
	var selecteddecks = [];
	var checked = []; // array to hold checked decks
    var fave = []
    var browselist = []; //array to hold cards to be browsed
    var currentcards = [];  //array to hold arrays of active cards
    var decklist = []; //array to hold decks of selected card
    var hintlist = []; //array to hold hints of selected card
    var fbDeckSetForSale = []; //array to hold ForSale value of DeckSets

    for (var i=0; i<8; i++) {   // Initializes arrays within currentcards
        currentcards[i] = [];
    }

 	var chosencard = {}; // placename for currentcard object
    var chosenposition = {}; // placename for currentcard position object
    var parsedPS = []; // Array to hold makeParsedPS object: FromPoint, ToPoint
    var randomcard = "";
	
    var questiontext = "";
    var answertext = []; // array to hold lines of answer
    
	var train = 0;
    var oldtrainval = 0;
    var newtrainval = 0;
    var currenttraining = 0;
    var randomcard = 0;
    var unseencount = 0;
    var learnedcount = 0;
    var trainingcount = 0;
    var lastcard = -1;

    var trainingsizelow = 10;  // Below which always gets an unseen card
    var trainingsizehigh = 20; // Above which never gets an unseen card
	
	var defaultThemeName = "theme1";
	var fbTheme = defaultThemeName;
    var fbShowPointNumbers = true;
	var fbShowPipcount = true;
    var fbShowDeckName = true;
    var fbShowDice = true;
    var fbDirection = true;
    var fbUITheme = true;
    var fbAnimation = .5;
    var fbShowTakiPoints = true
    var comapreFlag = false
    var settingsChangeFlag = false
    var themeChangeFlag = true
    var numberOfThemes = 3
    var undoFlag = false
    var showingAnswer = false
    var isMobile = true
    var browseMode = false
    var fbCoach = "True"
    var productPrefix = "ts3."
    var currentPage = "deckselect"
    var lastPage = ""
    var pageBeforeSettings = ""
    var hintOrigin = ""

    
// events

	$('#hard').on('vclick', function(){ ishard(); });
	$('#unsure').on('vclick', function(){ isunsure(); });
	$('#easy').on('vclick', function(){ iseasy(); });
	$('#reset').on('vclick', function(){ loadCard(); });
	$('#cleartrain').on('vclick', function(e){ 
        e.preventDefault();
        clearTraining(); 
    });
    $('#clearKeys').on('vclick', function(){ clearTrainingKeys(); });
    $('#clearselectedtrain').on('vclick', function(e){
        e.preventDefault();
        clearSelectedTraining(); 
    });
    $('#clearSelectedKeys').on('vclick', function(){ clearSelectedTrainingKeys(); });    
    $('#trainStart').on('vclick', function(){
        browseMode = false; 
        showloader('deckselect', loadCard);
    });
    $('#browseStart').on('vclick', function(){
        browseMode = true;
        showloader('deckselect', loadCard);
    });
    $('#beginBtn').on('vclick', function(){areAnyDecksSelected();});
    $('#nextBtn').on('vclick', function(){browseResult();});
	
	$('input[name="fbUITheme"]').change(function(){
		var uitheme = $(this).val();
		if (uitheme == "true") fbUITheme = true;
		else fbUITheme = false;
		changeUITheme(fbUITheme);
		if (storageAvailable('localStorage')) { localStorage.fbUITheme = uitheme; }
	});
	$('input[name="fbTheme"]').change(function(){
		fbTheme = $(this).val();
		changeTheme(fbTheme);
		if (storageAvailable('localStorage')) { localStorage.fbTheme = "" + fbTheme; }
        applySettings();
	});
	$('#animation').change(function(){
		fbAnimation = (100-($('#fbAnimation').val()))/50;
		changeAnimation(fbAnimation);
		if (storageAvailable('localStorage')) { localStorage.fbAnimation = "" + fbAnimation; }
	});
	$('input[name="fbDirection"]').change(function(){
		var direction = $(this).val();
		if (direction == "true") fbDirection = true;
		else fbDirection = false;
		changeDirection(fbDirection);
		if (storageAvailable('localStorage')) { localStorage.fbDirection = direction; }
	});
	$('input[name="fbShowDice"]').change(function(){
		fbShowDice = $('#fbShowDice').prop('checked');
		changeDice(fbShowDice);
		if (storageAvailable('localStorage')) { localStorage.fbShowDice = fbShowDice; }
	});
	$('input[name="fbShowPipcount"]').change(function(){
		fbShowPipcount = $('#fbShowPipcount').prop('checked');
		changePipCount(fbShowPipcount);
		if (storageAvailable('localStorage')) { localStorage.fbShowPipcount = fbShowPipcount; }
	});
	$('input[name="fbShowPointNumbers"]').change(function(){
		fbShowPointNumbers = $('#fbShowPointNumbers').prop('checked');
		changePointNumbers(fbShowPointNumbers);
		if (storageAvailable('localStorage')) { localStorage.fbShowPointNumbers = fbShowPointNumbers; }
	});
	$('input[name="fbShowTakiPoints"]').change(function(){
		fbShowTakiPoints = $('#fbShowTakiPoints').prop('checked');
		changeTakiPoints(fbShowTakiPoints);
		if (storageAvailable('localStorage')) { localStorage.fbShowTakiPoints = fbShowTakiPoints; }
	});
	$('input[name="fbShowDeckName"]').change(function(){
		fbShowDeckName = $('#fbShowDeckName').prop('checked');
		if (storageAvailable('localStorage')) { localStorage.fbShowDeckName = fbShowDeckName; }
	});
	// Prevents button from opening collapsible
	$('#swapButton').on('vclick', function() { fbswap(); return false;});  
    $('#questioncontainer').on('vclick', function(){ toggleAnswerContainer(); });
    $('#clearLS').on('vclick', function(){ clearLS(); }); // Dev only option
    $('#hintButton').on('vclick', function(){ openHint(); });
    $('#restorePurchases').on('vclick', function(){ restorePurchases(); });
    $('#clearDecks').on('vclick', function(){ clearSelectedDecks(); });

    $('#settingsHeaderButton').on('vclick', function(){
        $("body").pagecontainer("change", "#settings", {transition: "pop"});
    });
    
    $('#otherHeaderButton').on('vclick', function(){ otherHeaderFunction() });

    $('#homeHeaderButton').on('vclick', function(){
        $("body").pagecontainer("change", "#deckselect", {transition: "pop", reverse: "true"});
    });

    $('#infoHeaderButton').on('vclick', function(){ infoHeaderFunction() });

    $('.buying').on('vclick', function(){
        if (window.isphone){
            var res = "" + productPrefix + this.id.slice(-1);
            store.order(res);
        }
        else{
            alert("Desktop sim of buying deck " + this.id.slice(-1))
            afterBuy(this.id.slice(-1))
        }
    })

    // Setup for Persistent External Header
    $( "[data-role='header'], [data-role='footer']" ).toolbar({ theme: "a" });  
    $('#navPanel').enhanceWithin().panel();      

    $( document ).on( "pagecontainershow", function() {
        lastPage = currentPage
        currentPage = $.mobile.activePage.attr('id')
        //Keeps track of page that preceeds settings to prevent back-button loops

        if (lastPage == "deckselect" || lastPage == "flashcards" || lastPage == "stats"){
            pageBeforeSettings = lastPage
        }
        
        if (currentPage.indexOf("hint") !=-1) {     
            if (lastPage == "deckselect"){hintOrigin = "deckselect"}
            if (lastPage == "flashcards"){hintOrigin = "flashcards"}
            if (lastPage == "store"){hintOrigin = "store"}                
        }

        var current = $( ".ui-page-active" ).jqmData( "title" );

        if (current != "Flashcard") {$( "[data-role='header'] h1" ).text( current )}
        else {
            var headerText = getheaderText();
            $( "[data-role='header'] h1" ).text(headerText)
        }        
        // Bring the change header here from Loadcard, so it applies on return to Flashcard without new loadcard.

        if (current == "Select Deck"){
          $('#otherHeaderButton').addClass('ui-disabled')
          $('#homeHeaderButton').addClass('ui-disabled')          
        }
        else{
            $('#otherHeaderButton').removeClass('ui-disabled')            
            $('#homeHeaderButton').removeClass('ui-disabled')            
        }

        if (current == "Settings"){$('#settingsHeaderButton').addClass('ui-disabled')}     else{$('#settingsHeaderButton').removeClass('ui-disabled')}
        if (current == "About"){$('#aboutHeaderButton').addClass('ui-disabled')}     else{$('#aboutHeaderButton').removeClass('ui-disabled')}
        if (current == "Store"){$('#storeHeaderButton').addClass('ui-disabled')}     else{$('#storeHeaderButton').removeClass('ui-disabled')}                    
        if (current == "Help"){$('#infoHeaderButton').addClass('ui-disabled')}     else{$('#infoHeaderButton').removeClass('ui-disabled')}                    

        if (current == "Select Deck"){
          $('#cardNavbar').hide()
          $('#statsNavbar').hide()
          $('#statsCompareNavbar').hide()
          $('#deckNavbar').show()
          $('#browseNavbar').hide()                                                        
        }

        else if (current == "Flashcard"){
            if (browseMode){
              $('#deckNavbar').hide()
              $('#statsNavbar').hide()
              $('#statsCompareNavbar').hide()
              $('#cardNavbar').hide()
              $('#browseNavbar').show()                                                                      
            } 
            else {
              $('#deckNavbar').hide()
              $('#statsNavbar').hide()
              $('#statsCompareNavbar').hide()
              $('#cardNavbar').show()
              $('#browseNavbar').hide()                                              
            }

        }
        else if (current == "Stats"){
            if (compareFlag){
              $('#deckNavbar').hide()
              $('#cardNavbar').hide()
              $('#statsNavbar').hide()
              $('#statsCompareNavbar').show()
              $('#browseNavbar').hide()
            }
            else{
              $('#deckNavbar').hide()
              $('#cardNavbar').hide()
              $('#statsNavbar').show()
              $('#statsCompareNavbar').hide()
              $('#browseNavbar').hide()   
            }

        }
        else{
          $('#deckNavbar').hide()
          $('#cardNavbar').hide()
          $('#statsNavbar').hide()  
          $('#statsCompareNavbar').hide()        
          $('#browseNavbar').hide()                                                                    
        }
    });

    document.addEventListener("backbutton", onBackKeyDown, false);

    function onBackKeyDown() {
        // Handle the back button
        otherHeaderFunction()
    }

    var attachFastClick = Origami.fastclick;  // Workaround to prevent 300ms delay iOS
    var fcDeckSelect = document.getElementById('deckselect');
    var fcSettings = document.getElementById('settings');
    var fcHelp = document.getElementById('Help');    
    attachFastClick(fcDeckSelect);
    attachFastClick(fcSettings);    
    attachFastClick(fcHelp);        
/*    attachFastClick(document.body);*/





// code starts here

	init();
    
// initial functions
	function init() {
        //editMode = false;
		//bglogInitFlag = false;

        if (window.isphone){
            setTimeout(function () {
                navigator.splashscreen.hide();
            }, 0);
        }


        loadSettings(); // if ls.Value, fbValue = ls.value

        if (fbUITheme == true){
            changeGlobalTheme("a");
        } 
        else{
            changeGlobalTheme("b");
        }

        startIscroll(); // Deploys iscroll -- not needed for browsers	
		createDeckMenu();  // Deck menu and restore selected decks

        $('input[type=checkbox]').change(function(){
                manageDecks();
        });

        console.log("Before decksplit conditional")
		if (localStorage.selecteddecks){
			var decksplit = localStorage.selecteddecks.split(",");
            restoreSavedDecks(decksplit);
            console.log("Restoring decks: " + decksplit)
		}

        if (localStorage.fave){
            fave = localStorage.fave.split(",")
        }

        checkFavorites();

        try {
            eval(fbTheme);
        } catch (e) {
            console.log(e.message);
            fbTheme = defaultThemeName;
        }
		
		bglog = bglogSVG;
		twoCubesFlag = true;
		numberOfCubes = 2;
		var ua = navigator.userAgent.toLowerCase();
        isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
        
        // I believe the following can be removed.  badAndroidFlag no longer in use.
        if(isAndroid) { // all androids
			
			androidVersion = parseFloat(getAndroidVersion()); // eg 4.2
			//if (androidVersion < 4.4) bglog = bglogCanvas; // fallback to canvas
			//badAndroidFlag = false;
			if ((androidVersion == 4.1) || (androidVersion == 4.2) || (androidVersion == 4.3)) {
				// bad androids
				//badAndroidFlag = true;				
				var clickThreshold = 500; // ms
				last_click_time = new Date().getTime();
				document.addEventListener('click', function (e) {
					click_time = e['timeStamp'];
					if (click_time && (click_time - last_click_time) < clickThreshold) {
						e.stopImmediatePropagation();
						e.preventDefault();
						return false;
					}
					last_click_time = click_time;
				}, true);
			}
		}
		currentTheme = eval(fbTheme);
		animateFlag = false;
		bglog.makeBoard();
		changeTheme(fbTheme);
		applySettings();
		animateFlag = true;

        markSettings(); // adjust settings ui to fbValues
        manageDecks()

	}
	
	function getAndroidVersion(ua) {
		var ua = ua || navigator.userAgent; 
		var match = ua.match(/Android\s([0-9\.]*)/);
		return match ? match[1] : false;
	};
	
	function storageAvailable(type) {
		try {
			var storage = window[type],
				x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		}
		catch(e) {
			return false;
		}
	}

    function initStore(){
        if (window.isphone){
            if (!window.store) {
                alert('Store not available');
            return;
            }

            // Enable maximum logging level
            store.verbosity = store.DEBUG;

            store.register({
                id:    productPrefix + "4",    // Copy for additional products 
                alias: 'Opening Replies',
                type:   store.NON_CONSUMABLE
            });

            store.register({
                id:    productPrefix + "5",    // Copy for additional products 
                alias: 'Boot Camp: Extended',
                type:   store.NON_CONSUMABLE
            });


            // Log all errors
            store.error(function(error) {

                $('#loading').html("<strong>Unable to reach the store.</strong><br>Please check your internet connection and try again.");
            });

            // When purchase of the full version is approved,
            // show some logs and finish the transaction.
            store.when("product").approved(function (order) {
                order.finish();
            });

            store.when("product").owned(function (order) {
                var productNum = order.id.split('.')[1];
                afterBuy(productNum)

            });

            store.ready(function() {
                $('#loading').html("<strong>Decks available for purchase:</strong>");

                var p4 = store.get(productPrefix + "4")  // Copy for additional products
                $('#buying4').text("" + p4.alias) 
                $('#price4').text("" + p4.price);

                var p5 = store.get(productPrefix + "5")  // Copy for additional products
                $('#buying5').text("" + p5.alias) 
                $('#price5').text("" + p5.price);

                var p6 = store.get(productPrefix + "6")  // Copy for additional products
                $('#buying6').text("" + p6.alias) 
                $('#price6').text("" + p6.price);

            });

            store.refresh();
            sessionStorage.storeInit = "Initialized"    
        }
        else{
            $('#loading').html("<strong>Not on device. Cannot load store.</strong>");
        }
    }

    function startIscroll(){
        if(window.isphone) {
            var ua = navigator.userAgent.toLowerCase();
            if(ua.indexOf("android") == -1){  // Not Android
                if(ua.indexOf("os 8") > -1){ // iOS 8 only (must use iOS 8 or above)
                    $(".willScroll").attr("data-iscroll",""); //adds the data-iscroll attribute to the content div
                    $("[data-iscroll]").iscrollview(); // First create iscrollview
                    $("[data-iscroll]").iscrollview("refresh"); // now refresh the iscrollview
                }
            }            
        }
    }


    function createDeckMenu() {

        var deckSetOrder = [0, 1, 6, 2, 3, 4, 5, 8, 7]
        for (var h=deckSetOrder.length; h>0; h--){
            i = h - 1
            var content = '<fieldset data-role="collapsible" data-corners="false" class="decksetclass" id="' + DeckSet[deckSetOrder[i]].DeckSetName + '"><legend data-position="inline">' + DeckSet[deckSetOrder[i]].DeckSetName + '<span style="float:right;" class="button-span"><a id="buyButton' + deckSetOrder[i] + '" class="ui-btn ui-btn-icon-notext ui-icon-lock ui-corner-all buyButton metaButton" style="float:right"></a><a id="infoButton' + deckSetOrder[i] + '" style="float:right; margin-right: 10px;" class="ui-btn ui-btn-icon-notext ui-icon-info ui-corner-all infoButton metaButton"></a></span></legend><div data-role="controlgroup" data-corners="false" class="insidedecksetclass" id="Inside' + deckSetOrder[i] + '"></div></fieldset>'            

            $(content).prependTo('#selectDeckForm')

            var deckOrder = [30, 0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 9, 10, 11, 12, 13, 14, 15, 16, 17, 27, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 40, 31, 32, 33, 34, 35, 36, 37, 38, 39] 
            // To distinguish Deck number from Deck order.
            // May use same techinique for DeckSet above when needed.  

            for (var j=0; j<deckOrder.length; j++){
                if (Deck[deckOrder[j]].DeckSetID == deckSetOrder[i]){
                    var innercontent = '<label id="Label' + deckOrder[j] + '"><input type="checkbox" name="Deck' + deckOrder[j] + '" id="Deck' + deckOrder[j] + '">' + Deck[deckOrder[j]].DeckName + '</label>'
                    $(innercontent).appendTo('#Inside' + deckSetOrder[i]);
                }
            }
        }

        $('.insidedecksetclass').enhanceWithin();
        $('.insidedecksetclass').controlgroup({ corners: false });
        $('.decksetclass').collapsible();

        for (var k=0; k<DeckSet.length; k++){
            if (fbDeckSetForSale[k] == false){
                $('#buyButton' + k).removeClass('buyButton');
                $('#buyButton' + k).removeClass('ui-icon-lock');
                $('#buyButton' + k).addClass('ui-icon-check');
                $('#buyButton' + k).addClass('ui-disabled');
                $('#buying' + k).addClass('ui-disabled');

                for (var l=0; l<Deck.length; l++){
                    if (Deck[l].DeckSetID == k && Deck[l].IsSample == 1){
                        $('#Label' + l).css('display', 'none');
                        $('#Deck' + l).css('display', 'none');
/*                        $('label[for="Deck' + l +'"]').css('display', 'none');
                        $('#Deck' + l).css('display', 'none');*/
                    }
                }                
            }
            else{
                for (var l=0; l<Deck.length; l++){
                    if (Deck[l].DeckSetID == k && Deck[l].IsSample == 0){

                        $('#Deck' + l).checkboxradio( "disable" );
                    }
                }                
            }
        }

        $('.infoButton').click(function(e) {  // Should be moved to events, but for JQM refresh bug. 
            var infoNum = this.id
            infoNum = infoNum.replace( /^\D+/g, '');
            for (var m=0; m<Deck.length; m++){
                if (Deck[m].DeckSetID == infoNum){
                    $("body").pagecontainer("change", "#hint" + m, {transition: "slide"});
                    break;
                }
            }
            return false; // preventDefault
        });

        $('.buyButton').click(function(e) {  // Should be moved to events, but for JQM refresh bug. 
            openStore()
            return false; // preventDefault
        });        
    }

    function checkFavorites(){
        if (fave.length == 0){
            $('#Deck30').prop('checked', false).checkboxradio('refresh');
            $('#Deck30').checkboxradio('disable')
/*            $("label[for='Deck30']").html("No Saved Favorites");*/
            $("#Label30").html("No Saved Favorites");
            manageDecks()

        }
        else{
            $('#Deck30').checkboxradio('enable')
/*            $("label[for='Deck30']").html("Favorites");*/
            $("#Label30").html("Favorites");            
        }

    }

    function afterBuy(id){

        $("#buying" + id).addClass('ui-disabled');        
        $("#buyButton" + id).removeClass('ui-icon-lock');
        $("#buyButton" + id).addClass('ui-icon-check');
        $("#buyButton" + id).addClass('ui-disabled');

        localStorage["fbDeckSetForSale" + id] = "false"
        fbDeckSetForSale[id] = false
        for (var l=0; l<Deck.length; l++){
            if (Deck[l].DeckSetID == id){
                if (Deck[l].IsSample == 1){


                    // Remove the Sample Deck from Checked and Selected Decks 
                    $('#Deck' + l).prop("checked", false).checkboxradio("refresh");

                    // Hide the Sample Deck Checkbox 

                    //Example: <label><input type="checkbox" name="Deck4" id="Deck4">Primes</label>

/*                    $('label[for="Deck' + l +'"]').css('display', 'none');*/
                    $('#Label' + l).css('display', 'none');
                    $('#Deck' + l).css('display', 'none');
                                        
                }
                else $('#Deck' + l).checkboxradio( "enable" );
            }
        }
        manageDecks()  
    }

    function restorePurchases(){
        if (window.isphone) {store.refresh();}
        if (localStorage["fbDeckSetForSale4"] === "false"){
            var popup = setInterval(function(){   // Hack for Android auto-closing popups
                $("#purchasesRestored").popup("open");
                clearInterval(popup);
            },1);
        }
        else {
            var popup = setInterval(function(){   // Hack for Android auto-closing popups
                $("#noPurchases").popup("open");
                clearInterval(popup);
            },1);
        } 
    }

    function loadSettings(){  //Startup
		if (storageAvailable('localStorage')) {
			fbCoach = (localStorage.fbCoach === undefined) ? fbCoach = "True" : fbCoach = localStorage.fbCoach;
			fbTheme = (localStorage.fbTheme === undefined) ? fbTheme = "theme1" : fbTheme = localStorage.fbTheme;
            fbUITheme = (localStorage.fbUITheme === undefined) ? fbUITheme = "true" : fbUITheme = localStorage.fbUITheme;            
			fbAnimation = (localStorage.fbAnimation === undefined) ? fbAnimation = .75 : fbAnimation = Number(localStorage.fbAnimation);
			fbDirection = (localStorage.fbDirection === undefined) ? fbDirection = "true" : fbDirection = localStorage.fbDirection;
            fbShowDice = (localStorage.fbShowDice === undefined) ? fbShowDice = "true" : fbShowDice = localStorage.fbShowDice;
            fbShowPipcount = (localStorage.fbShowPipcount === undefined) ? fbShowPipcount = "true" : fbShowPipcount = localStorage.fbShowPipcount;
            fbShowPointNumbers = (localStorage.fbShowPointNumbers === undefined) ? fbShowPointNumbers = "true" : fbShowPointNumbers = localStorage.fbShowPointNumbers;
            fbShowTakiPoints = (localStorage.fbShowTakiPoints === undefined) ? fbShowTakiPoints = "true" : fbShowTakiPoints = localStorage.fbShowTakiPoints;
            fbShowDeckName = (localStorage.fbShowDeckName === undefined) ? fbShowDeckName = "true" : fbShowDeckName = localStorage.fbShowDeckName;

			if (fbDirection == "true") fbDirection = true; else fbDirection = false;
			if (fbUITheme == "true") fbUITheme = true; else fbUITheme = false;
			if (fbShowDice == "true") fbShowDice = true; else fbShowDice = false;
			if (fbShowPipcount == "true") fbShowPipcount = true; else fbShowPipcount = false;
			if (fbShowPointNumbers == "true") fbShowPointNumbers = true; else fbShowPointNumbers = false;
			if (fbShowTakiPoints == "true") fbShowTakiPoints = true; else fbShowTakiPoints = false;
            if (fbShowDeckName == "true") fbShowDeckName = true; else fbShowDeckName = false;            
			
			localStorage.fbCoach = fbCoach;
			localStorage.fbTheme = fbTheme;
			localStorage.fbAnimation =  "" + fbAnimation;
			localStorage.fbDirection = eval(fbDirection);
			localStorage.fbUITheme = eval(fbUITheme);        
			localStorage.fbShowDice = eval(fbShowDice); 
			localStorage.fbShowPipcount = eval(fbShowPipcount);
			localStorage.fbShowPointNumbers= eval(fbShowPointNumbers);
			localStorage.fbShowTakiPoints = eval(fbShowTakiPoints);
            localStorage.fbShowDeckName = eval(fbShowDeckName);            
			
			for (var i=0; i<DeckSet.length; i++){
				if (localStorage["fbDeckSetForSale" + i] === "false"){
					fbDeckSetForSale[i] = false    
				} else if (localStorage["fbDeckSetForSale" + i] === "true"){
					fbDeckSetForSale[i] = true
				} else{
					fbDeckSetForSale[i] = !!DeckSet[i].IsForSale
					localStorage["fbDeckSetForSale" + i] = fbDeckSetForSale[i].toString()                
				}
			}
		} else {
			console.log("LocalStorage inaccessible, defaults used");
		}
	}
	
    function markSettings(){  //Startup
		setTimeout(function () {
			$('#settings').page();
			$("input:radio[name='fbTheme']").each(function() { $(this).prop('checked', false); });
			$("input:radio[name='fbTheme'][value ='"+fbTheme+"']").prop('checked', true).checkboxradio("refresh");
			$("input:radio[name='fbDirection']").each(function() { $(this).prop('checked', false); });
			$("input:radio[name='fbDirection'][value ='"+fbDirection+"']").prop('checked', true).checkboxradio("refresh");

            $("input:radio[name='fbUITheme']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='fbUITheme'][value ='"+fbUITheme+"']").prop('checked', true).checkboxradio("refresh");

			$('#fbShowDice').prop('checked', fbShowDice).checkboxradio("refresh");
            $('#fbShowDeckName').prop('checked', fbShowDeckName).checkboxradio("refresh");            
			$('#fbShowPipcount').prop('checked', fbShowPipcount).checkboxradio("refresh");
			$('#fbShowPointNumbers').prop('checked', fbShowPointNumbers).checkboxradio("refresh");
			$('#fbShowTakiPoints').prop('checked', fbShowTakiPoints).checkboxradio("refresh");
			$('#fbAnimation').slider();
			$('#fbAnimation').val(100-(fbAnimation*50));
			$('#fbAnimation').slider('refresh');
		}, 200);
    }

    function applySettings(){
		changeAnimation(fbAnimation);
		changeDirection(fbDirection);
        changeUITheme(fbUITheme);
		changeDice(fbShowDice);
		changePipCount(fbShowPipcount);
		changePointNumbers(fbShowPointNumbers);
		changeTakiPoints(fbShowTakiPoints);

    }

	function changeTheme(themeName) {
		console.log("Changing theme to " + themeName);
		if (swapSidesFlag) bglog.swapSides(); // reset swapSides if necessary
		bglog.loadTheme(eval(themeName));
		showQuestion();
	}
	
	function changeAnimation(fbAnimation) {
		bglog.setAnimationSpeed(fbAnimation);
		
	}
	
    function changeDirection(fbDirection) {
        if (fbDirection == true){
          currentTheme.direction = false;
        } 
        else{
          currentTheme.direction = true;
        } 
        bglog.toggleDirection();
    }

    function changeUITheme(fbUITheme) {
        if (fbUITheme == true){
			currentTheme.canvasColor = "#F2F2F2";
			currentTheme.pipcountTextColor = "#000";
            $(".ui-page").css("background-color", "#F2F2F2");
            changeGlobalTheme("a");
        } 
        else{
			currentTheme.canvasColor = "#2a2a2a";
			currentTheme.pipcountTextColor = "#FFF";
            $(".ui-page").css("background-color", "#2a2a2a");
            changeGlobalTheme("b");
        }
		changeTheme("currentTheme");
    }

	function changePipCount(fbShowPipcount) {
		if (fbShowPipcount == true) currentTheme.showPipCount = false;
		else currentTheme.showPipCount = true;
		if (fbShowPipcount == true || showingAnswer == false) bglog.togglePipCount();  
        //  Toggles unless Pips are off and Answer is open -- when pips are reversed. 
	}

    function changeDice(fbShowDice) {
        if (fbShowDice == true) currentTheme.showDice = false;
            else currentTheme.showDice = true;
        bglog.toggleDice();
    }

    function changePointNumbers(fbShowPointNumbers){
    	if (fbShowPointNumbers == true) currentTheme.showPointNumbers = false;
            else currentTheme.showPointNumbers = true;
        bglog.toggleShowNumbers();
    }

    function changeTakiPoints(fbShowTakiPoints){
        if (fbShowTakiPoints == true) currentTheme.takiPoints = false;
            else currentTheme.takiPoints = true;
        bglog.toggletakiPoints();
    }

    function restoreSavedDecks(deckNames){
		for (var i=0;i<deckNames.length;i++){
			restoreSavedDeck(deckNames[i]);
		}
	}

    function restoreFaves(faveNames){
        for (var i=0;i<faveNames.length;i++){
            restoreFave(faveNames[i])
        }
    }

	function restoreSavedDeck(deckName){ // *** should use prop
		$(deckName).prop("checked", true).checkboxradio("refresh");
	}

    function clearTraining(){
/*        var popup = setInterval(function(){   // Hack for Android auto-closing popups*/
            $("#clearTrainingPopup").popup("open");
/*            clearInterval(popup);*/
/*        },1);*/

    }

    function clearSelectedTraining(){
/*        var popup = setInterval(function(){   // Hack for Android auto-closing popups*/
            $("#clearSelectedTrainingPopup").popup("open");
/*            clearInterval(popup);*/
/*        },1);*/

    }

    function clearTrainingKeys(){
		for (var key in localStorage){
			if (isTrainingKey(key)){
                console.log("Key = " + key)
				delete window.localStorage[key];
			}
		}

        clearTrainingFlag = true
        manageDecks()
        selectCards()
        showStats("Fresh")
    }

    function clearSelectedTrainingKeys(){
        for (var i=0; i<browselist.length; i++){
            var key = "train" + browselist[i].CardID
            delete window.localStorage[key];            
        }

        clearTrainingFlag = true
        manageDecks()
        selectCards()
        showStats("Fresh")
    }



    // Analyzes key for string "train" (train54, or Bearoff.Two)
    // @param {String} key
    // @return {bool} if key contains string "train"
    function isTrainingKey(key){
        return (key.indexOf("train") > -1);
    }

    function showStats(version){

        clearTrainingFlag = true
/*        selectCards()*/

        $('#stattext').empty();
        if (version == "Fresh"){
            $("body").pagecontainer("change", "#stats", {transition: "pop"});
            selectCards()
            console.log("Oldstats updated; version = Fresh")

        }
        else {
            $("body").pagecontainer("change", "#stats", {transition: "pop", reverse: "true"});
        }
		

        var thenum = ""

        for (var i=0; i<checked.length; i++){
            thenum = checked[i].replace( /^\D+/g, ''); // Get deck number
            console.log("i = " + i + "; thenum = " + thenum)
            if (i==0){
                statrow = "<tr><td width = '180'><b>Selected Decks: </b></td><td colspan='4'>" + Deck[thenum].DeckName + "</td></tr>";
                $('#stattext').append(statrow);
            }
            else{
                statrow = "<tr><td> </td><td colspan='4'>" + Deck[thenum].DeckName + "</td></tr>";
                $('#stattext').append(statrow);
            }
        }

        statrow = "<tr><td></td><td width = '10'></td></tr>";
        $('#stattext').append(statrow);
        $('#stattext').append(statrow); 
         
        var totalcards = 0
        for (var i=0; i < 8; i++){
            totalcards = totalcards + currentcards[i].length 
            }

        statrow = "<tr><td><b>Selected Cards: </b></td><td>" + totalcards + "</td>";
        if (version == "Fresh"){  // or browsemode
            statrow += "</tr>"
        }
        else {
            statrow += "<td></td><td colspan = 3><strong>Change:</strong></td></tr>"
        }


        $('#stattext').append(statrow);

        statrow = "<tr><td> </td></tr>";
        $('#stattext').append(statrow);
        $('#stattext').append(statrow);   

        for (var i=0; i < 8; i++){ 

            if (i == 0){
                statrow = "<tr><td>Unseen cards: </td><td>" + currentcards[i].length + "</td>";
                if (version != "Fresh"){statrow += "<td></td><td " + formatStatDiff(i) + "</td>"}
                statrow += "</tr><tr></tr>"
                $('#stattext').append(statrow);
            }
            
            else if (i == 7){
                statrow = "<tr></tr><tr><td>Learned cards: </td><td>" + currentcards[i].length + "</td><td></td>"
                if (version != "Fresh"){statrow += "<td " + formatStatDiff(i) + "</td>"}
                statrow += "</tr>";
                $('#stattext').append(statrow);
            }

            else {
                statrow = "<tr><td>Cards in group " + i + ":</td><td>&nbsp</td><td>" + currentcards[i].length + "</td>"
                if (version != "Fresh"){statrow += "<td " + formatStatDiff(i) + "</td>"}
                statrow += "</tr>";
                $('#stattext').append(statrow);
            }
            medStats[i] = currentcards[i].length
        }
        if (version == "Fresh") {oldStats = medStats.slice();}
    };


    function formatStatDiff(i){
        var statDiff = currentcards[i].length - oldStats[i]
        console.log("Oldstats = " + oldStats[i])
        if (statDiff < 0){
            var fStatDiff = "width = '10' style='color:red'>-</td><td style='color:red'>" + Math.abs(statDiff)
        }
        else if (statDiff > 0) {
            var fStatDiff = "style='color:green'>+</td><td style='color:green'>" + Math.abs(statDiff)
        }
        else if (statDiff == 0) {var fStatDiff = ""}
        return fStatDiff
    }

// mainEngine functions

    function showloader(divID, destination){
        $('#' + divID).spin('custom', 'black');
        setTimeout(function () {
            destination();
            $('#' + divID).spin(false);
        }, 0)
        return
    }

    function clearSelectedDecks(){
        for (var j=0; j<Deck.length; j++){
            $('#Deck' + j).prop("checked", false).checkboxradio("refresh");
            } 
        checked.length = 0;
        selecteddecks.length = 0;
        localStorage.selecteddecks = ""
        manageDecks()
       
    }

    function manageDecks(){
        checked.length = 0;
        selecteddecks.length = 0;
        selecteddecksets.length = 0
        var deckReportNum = 0


        for (var j=0; j<Deck.length; j++){
            if ($('#Deck' + j).prop("checked") == true){    
                checked.push("Deck" + j);
                selecteddecks.push("#Deck" + j)
                selecteddecksets.push(Deck[j].DeckSetID)
                deckReportNum = deckReportNum + 1
            }
        }

        for (var k=0; k<DeckSet.length; k++){
            if (selecteddecksets.indexOf(k) > -1){
                $( '#buyButton' + k).css( 'opacity', '1' );                
            }
            else {
                if (fbDeckSetForSale[k] == false){
                    $( '#buyButton' + k).css( 'opacity', '.3' );
                }
                else {
                    $( '#buyButton' + k).css( 'opacity', '.5' );                    
                }
            }
        }


        $('#numDeckSpan').html(deckReportNum);
        if (deckReportNum == 0){$('#clearDecks').addClass('ui-disabled')}
        else {$('#clearDecks').removeClass('ui-disabled')}    
        localStorage.selecteddecks = "" + selecteddecks.toString();
        console.log("Selected decks: " + selecteddecks)      
        console.log("Local Storage Selected decks: " + localStorage.selecteddecks)
    }

		
    function areAnyDecksSelected(){
        if (checked.length == 0){
            $("#NoneSelectedPopup").popup("open");
            return
        }
        compareFlag = false
        showStats("Fresh")
    }


    function selectCards(){  //  Loads currentcards[train] with cards from selected decks

        browselist = [];
        
        for (var i=0; i < Card.length; i++){
            if ('decklist' in Card[i]){Card[i].decklist.length = 0}
            if ('hintlist' in Card[i]){Card[i].hintlist.length = 0}
            if ('namelist' in Card[i]){Card[i].namelist.length = 0}
        }

        for (var i=0; i<8; i++){
            currentcards[i].length = 0;
        }
        
        for (var i=0; i < CardInDeck.length; i++){
            if (checked.indexOf('Deck30') > -1){ // If favorites . . .
                if (checked.indexOf('Deck' + CardInDeck[i].DeckID) > -1 || fave.indexOf('Card' + CardInDeck[i].CardID) > -1){
                    loadCurrentCards(i)
                } 
            }
            else 
                if (checked.indexOf('Deck' + CardInDeck[i].DeckID) > -1){
                    loadCurrentCards(i)
                }
        }
    }


    function loadCurrentCards(i){
        if (!('decklist' in Card[CardInDeck[i].CardID])){
            Card[CardInDeck[i].CardID].decklist = []
        }
        
        Card[CardInDeck[i].CardID].decklist.push(CardInDeck[i].DeckID)

        if (!('hintlist' in Card[CardInDeck[i].CardID])){Card[CardInDeck[i].CardID].hintlist = []}
        Card[CardInDeck[i].CardID].hintlist.push(CardInDeck[i].DeckHintPointer)            

        if (!('namelist' in Card[CardInDeck[i].CardID])){Card[CardInDeck[i].CardID].namelist = []}
        if (typeof CardInDeck[i].PositionName === "undefined"){CardInDeck[i].PositionName = ""}     
        Card[CardInDeck[i].CardID].namelist.push(CardInDeck[i].PositionName)            

        browselist[browselist.length] = Card[CardInDeck[i].CardID]
        if (localStorage['train' + CardInDeck[i].CardID]){
            train = Number(localStorage['train' + CardInDeck[i].CardID]);
            Card[CardInDeck[i].CardID].trainval = train;
            currentcards[train][currentcards[train].length] = Card[CardInDeck[i].CardID];
        }

        else {
            train = 0;
            Card[CardInDeck[i].CardID].trainval = 0;
            currentcards[0][currentcards[0].length] = Card[CardInDeck[i].CardID];
        }

    }

    function loadCard(){

		$("body").pagecontainer("change", "#flashcards", {transition: "pop"});
        undo();  // Resets move animtion

        if (browseMode){
            browsecard();
        } 
        else {
            choosecard();
            lastcard = chosencard.CardID;  //Allows for check of card twice in succession
        }

        chooseposition();
		
        $("#questioncontainer").css("text-align", "left");
		$('#questioncontainer').removeClass("ui-icon-minus");
		$('#questioncontainer').addClass("ui-icon-plus");
		
        if (fbShowPipcount == false && showingAnswer == true) bglog.togglePipCount()

        if (swapSidesFlag) bglog.swapSides(); // reset swapSides if necessary
        $("#belowAnswerContainer").show()
		
        if (chosencard.CardKind == 0){
            $("#swapButton").show();
        }
        else{
            $("#swapButton").hide();
            bglog.moveCube(2,"off",0);
        }

        if (chosencard.CardKind > 1){
            $("#bglogContainer").slideUp();
        }
        else{
            $("#bglogContainer").slideDown();
            bglog.loadXgId("XGID=" + chosenposition.XGID);
			if (chosencard.CardKind == 0){
				if (chosenposition.Score1 == 0) bglog.moveCube(2,"bot",1);
            	else bglog.moveCube(2,"off",0);
			}
        }
        
        $("#outerAnswerContainer").hide();
        showingAnswer = false;    

        var headerText = getheaderText();
        $( "[data-role='header'] h1" ).text(headerText);
        showQuestion();
        showAnswer();
        return
    }

    function getheaderText(){
        if (fbShowDeckName == true){
            if (chosencard.decklist.length > 1) {
                var headerText = "Multiple Decks"
            }
            else {
                var headerText = Deck[chosencard.decklist[0]].DeckName
            }
        }
        else{
            var headerText = "FlashBack"
        }

        return(headerText)
    }





    function showQuestion(){

        var colorName = currentTheme.ourCheckerColorText
        var crawFlag = ""
        var scoreText = ""
        var leadFlag = ""

        if (chosencard.CardKind == 2){

            if (chosenposition.iNeed > chosenposition.youNeed){leadFlag = " leads: "}
            else if (chosenposition.iNeed < chosenposition.youNeed){leadFlag = " trails: "}
            else {
                leadFlag = " is even: ";
                colorName = "Match";
            }

            if (chosenposition.iNeed == -1 || chosenposition.youNeed == -1){crawFlag = ", Crawford"}

            scoreText = colorName + leadFlag + chosenposition.iNeed + ", " + chosenposition.youNeed + crawFlag + "."

            if (chosenposition.Concepttype == "TP"){
                questiontext = scoreText + "<br>" + currentTheme.ourCheckerColorText + " is doubled to " + chosenposition.Cube + ".  Take point?"
                }

            if (chosenposition.Concepttype == "MWC"){
                questiontext = scoreText + "<br>Match Winning Chances?" 
            } 
        }

        else if (chosencard.CardKind == 3){
            questiontext = "<p style='text-align:center'>" + chosenposition.RuleName + ":<br>" 
            for (i = 0; i < chosenposition.Subrules.length; i++) {
                questiontext = questiontext.concat(String.fromCharCode(65 + i) + ". ")
            }
        }

        else{
            if (matchLength == 0){scoreText = "Money game."}
            else{
                var ourNeed = ourScore - matchLength;
                var oppNeed = oppScore - matchLength;
                if (ourScore > oppScore) {leadFlag = "leads:"}
                else if (ourScore < oppScore) {leadFlag = "trails:"}
                else {leadFlag = "is even:"}
                if (crawfordFlag) {crawFlag = ", Crawford"}
                else {crawFlag = ""}
                scoreText = " " + currentTheme.ourCheckerColorText + " " + leadFlag + " " + ourNeed + ", " + oppNeed + crawFlag + ".";
            } 

            if (chosencard.CardKind == 0) {questiontext = currentTheme.ourCheckerColorText + " on roll, Cube Action?<br>" + scoreText}
            else if (chosencard.CardKind == 1) {
                // Check that card is in Replies decks
                if (chosencard.CardID > 2749 && chosencard.CardID < 5270){var replyText = getOpeningPlay()}
                else {var replyText = ".<br>"}

                questiontext = currentTheme.ourCheckerColorText + " to play " + leftDie + rightDie + replyText + scoreText;
            }
        }
      
		$('#questioncontainer').html(questiontext);
        return
    }


    function getOpeningPlay(){
        var opens_in_order = ['21$', '21S', '31P', '41$', '41S', '51$', '51S', '61P', '32D', '32S', '32Z', '42P', '52D', '52S', '62$', '62R', '62S', '43D', '43S', '43U', '43Z', '53P', '63R', '63S', '54D', '54S', '64P', '64R', '64S', '65R']

        var openingNumber = Math.ceil(((chosencard.CardID - 2749) % 630) / 21)
        var openingPlay = opens_in_order[openingNumber - 1]
        var openingPlayText = " after " + openingPlay + ".<br>"
        return openingPlayText
    }

    function showAnswer(){
		
        $('.answerContainer div .iscroll-content').empty();
		
        if (chosencard.CardKind == 0){
            showCubeAnswer();
        }

        else if (chosencard.CardKind == 1){
            showPlayAnswer();
        }
		        
        else if (chosencard.CardKind == 2){
            showConceptAnswer();
        }

        else if (chosencard.CardKind == 3){
            showRuleAnswer();
        }

        var insertTable = "";

        for (var i=0; i < answertext.length; i++){
            insertTable += answertext[i]
        }

        var currentNameList = ""
        for (var i=0; i < chosencard.namelist.length; i++){
            currentNameList += "" + chosencard.namelist[i] + "<br>";
        }

        insertTable += "<table cellpadding='0' cellspacing='0'><tr><td width = 2></td><td width='100'></td><td width='201'></td><td width='10'></td><td width='30'></td></tr>"
        insertTable += "<tr><td colspan = 5><hr></td></tr>"

        if (fave.indexOf('Card' + chosencard.CardID) > -1){
            insertTable += "<tr><td></td><td><strong>" + currentNameList + "</strong></td><td style='text-align:right'><div id='remFavMessage' class='favMessage'>Removed from Favorites</div><div id='addFavMessage' class='favMessage'>Added to Favorites</div></td><td></td><td><div id='favButton' class='ui-btn ui-icon-star ui-alt-icon ui-btn-icon-notext ui-corner-all'></div></td></tr>"}

        else {insertTable += "<tr><td></td><td><strong>" + currentNameList + "</strong></td><td style='text-align:right'><div id='remFavMessage' class='favMessage'>Removed from Favorites</div><div id='addFavMessage' class='favMessage'>Added to Favorites</div></td><td></td><td><div id='favButton' class='ui-btn ui-icon-star ui-btn-icon-notext ui-corner-all'></div></td></tr>"}

        insertTable += "</table>" 
        insertTable += "<br><br><br><br><br><br><br><br><br><br><br><br>";    

        $('.answerContainer div .iscroll-content').append(insertTable);
        $('.answerContainer').iscrollview("scrollTo", 0, 0, 0, false);


//  These functions should be moved to events, but for JQM refresh bug.
//  Can't give properties to button that is only later injected into DOM.  

		$('.movebutton').click(function(e) {  
            $('.movebutton').not(this).addClass('ui-disabled')
			$(this).removeClass('ui-icon-carat-r');
			$(this).addClass('ui-icon-carat-l');
            animate($(this).text());
			return false; // preventDefault
        });


        $("#outdistbtn").click(function(){
            $(".outcomedist").toggle(250);
            setTimeout(function () {
                $(".answerContainer").iscrollview("refresh");
                window.scrollTo(0);
            }, 10);            
        });


        $('#favButton').on('vclick', function(){ manageFav(); });        

        return
    }
			
    function toggleAnswerContainer(){  // Simulates collapsible: iscrollview buggy on collapsibles.

        if(fbShowPipcount == false) bglog.togglePipCount()

        if(showingAnswer){
            $("#outerAnswerContainer").hide()
            $("#belowAnswerContainer").show()
			$('#questioncontainer').removeClass("ui-icon-minus");
			$('#questioncontainer').addClass("ui-icon-plus");
            showingAnswer = false
        }
        else{
            $("#outerAnswerContainer").show()
            $("#belowAnswerContainer").hide()
			$('#questioncontainer').removeClass("ui-icon-plus");
			$('#questioncontainer').addClass("ui-icon-minus");
            showingAnswer = true
        }
		
        $(".answerContainer").iscrollview("refresh");
        return
    }


function showCubeAnswer(){
        answertext = [];
        cubeDataNum = getCubeData();                          // Equities and errors
        cubeColor = getCubeColors(cubeDataNum);               // Text color 
        cubeActions = getCubeActions(cubeDataNum);            // "Double / Pass" labels
        cubeData = formatCubeData(cubeDataNum, cubeActions);  // Add parenthesis and +/- signs
        cubeOutcomes = getCubeOutcomes();                     // Raw outcome distribution signs

        answertext[answertext.length] = "<table><tr><td width='130'></td><td width='65'></td><td width='65'></td><td></td></tr>";

        if (matchLength > 0){
            answertext[answertext.length] = "<tr><td><b>Score:</b></td><td colspan='3' style='text-align:left'><b>" + cubeActions.scoreDouble + " / " + cubeActions.scoreTake + "</b></td></tr>";
            answertext[answertext.length] = "<tr><td>No Double</td><td>" + cubeData.scoreND + "</td><td style='color:" + cubeColor.scoreNDEr + "'>" + cubeData.scoreNDEr + "</tr>";
            answertext[answertext.length] = "<tr><td>Double/Take</td><td>" + cubeData.scoreDT + "</td><td style='color:" + cubeColor.scoreDTEr + "'>" + cubeData.scoreDTEr + "</tr>";
            answertext[answertext.length] = "<tr><td>Double/Pass</td><td>+1.000</td><td style='color:" + cubeColor.scoreDPEr + "'>" + cubeData.scoreDPEr + "</tr>";
            answertext[answertext.length] = "<tr style='font-size:90%'><td colspan='10'><b>W:</b> " + cubeOutcomes.SPlainW + " (" + cubeOutcomes.SGammonW + ", " + cubeOutcomes.SBackgammonW + ") &nbsp;&nbsp;--&nbsp;&nbsp;&nbsp;<b>L:</b> " + cubeOutcomes.SPlainL + " (" + cubeOutcomes.SGammonL + ", " + cubeOutcomes.SBackgammonL +")</td></tr>"                                     
            answertext[answertext.length] = "<tr><td colspan='100'><hr></td></tr><tr></tr>"; 
        }

        answertext[answertext.length] = "<tr><td><b>Money:</b></td><td colspan='3' style='text-align:left'><b>" + cubeActions.moneyCombo + " / " + cubeActions.moneyTake + "</b></td></tr>";
        if (cubeActions.moneyCombo == "No Double (Redouble)"){
            answertext[answertext.length] = "<tr><td></td><td colspan='3' style='text-align:left'><b>Lotto Paradox!</b></td></tr>";
        }


        answertext[answertext.length] = "<tr><td>No Double</td><td>" + cubeData.moneyND + "</td><td style='color:" + cubeColor.moneyNDEr + "'>" + cubeData.moneyNDEr + "</tr>";
        answertext[answertext.length] = "<tr><td>No Redouble</td><td>" + cubeData.moneyNRD + "</td><td style='color:" + cubeColor.moneyNRDEr + "'>" + cubeData.moneyNRDEr + "</tr>";
        answertext[answertext.length] = "<tr><td>Double/" + cubeActions.moneyTakeString + "</td><td>" + cubeData.moneyDT + "</td><td style='color:" + cubeColor.moneyDTEr + "'>" + cubeData.moneyDTEr + "</tr>";
        answertext[answertext.length] = "<tr><td>Double/Pass</td><td>+1.000</td><td style='color:" + cubeColor.moneyDPEr + "'>" + cubeData.moneyDPEr + "</tr>";
        answertext[answertext.length] = "<tr style='font-size:90%'><td colspan='10'><b>W:</b> " + cubeOutcomes.MPlainW + " (" + cubeOutcomes.MGammonW + ", " + cubeOutcomes.MBackgammonW + ")&nbsp;&nbsp;--&nbsp;&nbsp;&nbsp;<b>L:</b> " + cubeOutcomes.MPlainL + " (" + cubeOutcomes.MGammonL + ", " + cubeOutcomes.MBackgammonL +")</td></tr>" // </table>"

        return(answertext);
    }

    function getCubeOutcomes(){
        var cubeOutcomes = [];

        if (matchLength > 0){
            cubeOutcomes.SPlainW = Outcome[0][chosenposition.positionIndex].PlainW
            cubeOutcomes.SGammonW = Outcome[0][chosenposition.positionIndex].GammonW
            cubeOutcomes.SBackgammonW = Outcome[0][chosenposition.positionIndex].BackgammonW
            cubeOutcomes.SPlainL = Outcome[0][chosenposition.positionIndex].PlainL
            cubeOutcomes.SGammonL = Outcome[0][chosenposition.positionIndex].GammonL
            cubeOutcomes.SBackgammonL = Outcome[0][chosenposition.positionIndex].BackgammonL

            var otherOutcomeIndex = CubeCard[chosencard.CardID][1]
            console.log("chosencard.CardID = " + chosencard.CardID)
            console.log("Other Outcome Index =" + otherOutcomeIndex)

            cubeOutcomes.MPlainW = Outcome[0][otherOutcomeIndex].PlainW
            cubeOutcomes.MGammonW = Outcome[0][otherOutcomeIndex].GammonW
            cubeOutcomes.MBackgammonW = Outcome[0][otherOutcomeIndex].BackgammonW
            cubeOutcomes.MPlainL = Outcome[0][otherOutcomeIndex].PlainL
            cubeOutcomes.MGammonL = Outcome[0][otherOutcomeIndex].GammonL
            cubeOutcomes.MBackgammonL = Outcome[0][otherOutcomeIndex].BackgammonL
        }
        else{
            cubeOutcomes.MPlainW = Outcome[0][chosenposition.positionIndex].PlainW
            cubeOutcomes.MGammonW = Outcome[0][chosenposition.positionIndex].GammonW
            cubeOutcomes.MBackgammonW = Outcome[0][chosenposition.positionIndex].BackgammonW
            cubeOutcomes.MPlainL = Outcome[0][chosenposition.positionIndex].PlainL
            cubeOutcomes.MGammonL = Outcome[0][chosenposition.positionIndex].GammonL
            cubeOutcomes.MBackgammonL = Outcome[0][chosenposition.positionIndex].BackgammonL
        }

        return(cubeOutcomes)
    }


    function getCubeData(){
        var cubeData = [];

        for (var i=0, j=CubeCard[chosencard.CardID].length; i < j; i++){ //  This is a loop because the first item might be a money cube or might be a score cube.
            if (CubePosition[CubeCard[chosencard.CardID][i]].Score1 == 0){
                cubeData.moneyDT = CubePosition[CubeCard[chosencard.CardID][i]].DTEq;
                if (CubePosition[CubeCard[chosencard.CardID][i]].CubeOwner == 0){
                    cubeData.moneyND = CubePosition[CubeCard[chosencard.CardID][i]].NDEq;
                }
                else{
                    cubeData.moneyNRD = CubePosition[CubeCard[chosencard.CardID][i]].NDEq;
                }    
            }
            else{
                cubeData.scoreND = CubePosition[CubeCard[chosencard.CardID][i]].NDEq;
                cubeData.scoreDT = CubePosition[CubeCard[chosencard.CardID][i]].DTEq;
            }
        }

        cubeData.moneyNDEr = (cubeData.moneyND - (Math.min(cubeData.moneyDT, 1))  ).toFixed(3)

        cubeData.moneyNRDEr = (cubeData.moneyNRD - (Math.min(cubeData.moneyDT, 1)) ).toFixed(3)
        cubeData.scoreNDEr = (cubeData.scoreND - (Math.min(cubeData.scoreDT, 1)) ).toFixed(3)
        
        if (cubeData.moneyNRD > 1){cubeData.moneyDPEr = (1 - cubeData.moneyNRD).toFixed(3);}
        else{cubeData.moneyDPEr = (1 - cubeData.moneyDT).toFixed(3);}

        if (cubeData.scoreND > 1){cubeData.scoreDPEr = (1 - cubeData.scoreND).toFixed(3);}
        else{cubeData.scoreDPEr = (1 - cubeData.scoreDT).toFixed(3);}


        if (cubeData.moneyDT >= 1){cubeData.moneyDTEr = (cubeData.moneyDT - Math.max(cubeData.moneyNRD, 1)).toFixed(3);}
        else {cubeData.moneyDTEr = (cubeData.moneyDT - cubeData.moneyNRD).toFixed(3);}

        if (cubeData.scoreDT >= 1){cubeData.scoreDTEr = (cubeData.scoreDT - Math.max(cubeData.scoreND, 1)).toFixed(3);}
        else {cubeData.scoreDTEr = (cubeData.scoreDT - cubeData.scoreND).toFixed(3);}

        return(cubeData)
    }

    function getCubeColors(cubeDataNum){
        cubeColor = {}
        cubeColor.moneyNDEr = getCubeColor(cubeDataNum.moneyNDEr)
        cubeColor.moneyNRDEr = getCubeColor(cubeDataNum.moneyNRDEr)
        cubeColor.moneyDPEr = getCubeColor(cubeDataNum.moneyDPEr)
        cubeColor.moneyDTEr = getCubeColor(cubeDataNum.moneyDTEr)
        cubeColor.scoreNDEr = getCubeColor(cubeDataNum.scoreNDEr)
        cubeColor.scoreDPEr = getCubeColor(cubeDataNum.scoreDPEr)
        cubeColor.scoreDTEr = getCubeColor(cubeDataNum.scoreDTEr)
        return cubeColor
    }

    function getCubeColor(eqDiff){
        var acubeColor = "" // Default will change with theme 
        if (Math.abs(eqDiff) > .01) {acubeColor = "green"} //#009933"}
        if (Math.abs(eqDiff) > .10) {acubeColor = "red"} //#FF0000"}
        return acubeColor
    }

    function formatCubeData(cubeData, cubeActions){
        for (datum in cubeData) {
                if (cubeData[datum] >= 0){
                    cubeData[datum] = "+" + cubeData[datum] 
                }
                else cubeData[datum] = "- " + (cubeData[datum] * -1)
            }
        
        if (cubeActions.moneyTake == "Pass"){
            if (cubeActions.moneyReDouble == "Too Good"){cubeData.moneyNRDEr = "";}
            else{cubeData.moneyDPEr = "";}
        }

        if (cubeActions.moneyTake == "Beaver"){
            cubeData.moneyNDEr = "";
            cubeData.moneyNRDEr = "";
        }
        
        if (cubeActions.moneyTake == "Take"){
            if (cubeActions.moneyDouble == "Double" || cubeActions.moneyReDouble == "Redouble"){cubeData.moneyDTEr = "";}  
            if (cubeActions.moneyDouble == "No Double"){cubeData.moneyNDEr = "";}
            if (cubeActions.moneyReDouble == "No Redouble"){cubeData.moneyNRDEr = "";}
        }

        if (cubeActions.moneyDouble == "Too Good"){cubeData.moneyNRDEr = "";}

        /*Score*/
        if (cubeActions.scoreTake == "Pass"){
            if (cubeActions.scoreDouble == "Too Good"){cubeData.scoreNDEr = "";}
            else {cubeData.scoreDPEr = "";}
        }
                
        if (cubeActions.scoreTake == "Take"){
            if (cubeActions.scoreDouble == "Double"){cubeData.scoreDTEr = "";}            
            else {cubeData.scoreNDEr = "";}
        }

        if (cubeData.moneyNRDEr != ""){cubeData.moneyNRDEr = "(" + cubeData.moneyNRDEr + ")";}
        if (cubeData.moneyNDEr != ""){cubeData.moneyNDEr = "(" + cubeData.moneyNDEr + ")";}
        if (cubeData.moneyDTEr != ""){cubeData.moneyDTEr = "(" + cubeData.moneyDTEr + ")";}
        if (cubeData.moneyDPEr != ""){cubeData.moneyDPEr = "(" + cubeData.moneyDPEr + ")";}

        if (cubeData.scoreNDEr != ""){cubeData.scoreNDEr = "(" + cubeData.scoreNDEr + ")";}
        if (cubeData.scoreDTEr != ""){cubeData.scoreDTEr = "(" + cubeData.scoreDTEr + ")";}
        if (cubeData.scoreDPEr != ""){cubeData.scoreDPEr = "(" + cubeData.scoreDPEr + ")";}        

        return(cubeData)
    }


    function getCubeActions(cubeData){
        var cubeActions = [];
        
        if (cubeData.moneyNRD < cubeData.moneyDT){
            if (cubeData.moneyNRD > 1){cubeActions.moneyReDouble = "Too Good";}
            else{cubeActions.moneyReDouble = "Redouble";}
        }
        else {cubeActions.moneyReDouble = "No Redouble";}

        if (cubeData.moneyND < cubeData.moneyDT){cubeActions.moneyDouble = "Double";}
        else {cubeActions.moneyDouble = "No Double";}

        if (cubeActions.moneyDouble == "No Double"){
            if (cubeActions.moneyReDouble == "No Redouble"){cubeActions.moneyCombo = "No (Re)Double";}
            else {cubeActions.moneyCombo = "No Double (Redouble)";}
        }
        else {
            if (cubeActions.moneyReDouble == "No Redouble"){cubeActions.moneyCombo = "Double (No Redouble)";}
            else if (cubeActions.moneyReDouble == "Redouble"){cubeActions.moneyCombo = "(Re)Double";}
            else {cubeActions.moneyCombo = "Double (Too Good)";}
        }


        if (cubeData.moneyDT >= 1){
            cubeActions.moneyTake = "Pass";
            cubeActions.moneyTakeString = "Take";
        }
        else{
            if(cubeData.moneyDT < 0){
                cubeActions.moneyTake = "Beaver";
                cubeActions.moneyTakeString = "Beaver";
            }
            else{
                cubeActions.moneyTake = "Take"
                cubeActions.moneyTakeString = "Take";
            }
        }
 /*       Score Actions*/

        if (cubeData.scoreND < cubeData.scoreDT){
            if (cubeData.scoreND > 1){cubeActions.scoreDouble = "Too Good";}
            else{cubeActions.scoreDouble = "Double";}
        }
        else{cubeActions.scoreDouble = "No Double";}

        if (cubeData.scoreDT >= 1){cubeActions.scoreTake = "Pass";}
        else{cubeActions.scoreTake = "Take"}
        return(cubeActions)
    }

    function showPlayAnswer(){

        answertext = [];
		answertext[answertext.length] = "<table cellpadding='0' cellspacing='0'><tr><td width='60'></td><td width='150'></td><td width='20'></td><td></td><td></td><td width='20'></td><td></td></tr>";

        if (matchLength > 0){
            var firstanswertext = getPlayResults(chosenposition.positionIndex, "Score");

            answertext[answertext.length] = "<tr><td colspan='100'><hr></td></tr><tr></tr>";
            // "Honey" indicates Money, but after Score.  Used to remove the excess info button
            var secondanswertext = getPlayResults(getMoneyPlayPosition(), "Honey");
            answertext = secondanswertext;
            answertext[answertext.length] = "</table>";
        }
        else{
            var thirdanswertext = getPlayResults(chosenposition.positionIndex, "Money");
            answertext = thirdanswertext;
            answertext[answertext.length] = "</table>";
        }

        return(answertext);
    }

    function getPlayResults(PPosition, flag){
        for (var i=0, j=Object.keys(Play[PPosition]).length; i < j; i++){
                if (i == 0){                // Different equity formating for best play
                    var signString = "";
                    var bestPlay = Play[PPosition][i].PlayString;
                    var leadEq = Play[PPosition][i].PlayEquity;
                    if (Play[PPosition][i].PlayEquity < 0){
                        signString = "-";
                        leadEq = Math.abs(leadEq);
                    }
                    if (flag == "Honey"){  //  Distinguishes Money after Score.  No Info icon.
                        flag = "Money"
                        answertext[answertext.length] = "<tr><td><strong>" + flag + ":&nbsp;</strong></td><td><div class='ui-btn ui-mini ui-icon-carat-r ui-btn-icon-right ui-corner-all movebutton' style='width:70%;text-align:left;margin:3px;'>" + bestPlay + "</div></td><td></td><td>" + signString + "</td><td><strong>" + leadEq + "</strong></td><td></td><td></td></tr>";
                    }
                    else{
                        answertext[answertext.length] = "<tr><td><strong>" + flag + ":&nbsp;</strong></td><td><div class='ui-btn ui-mini ui-icon-carat-r ui-btn-icon-right ui-corner-all movebutton' style='width:70%;text-align:left;margin:3px;'>" + bestPlay + "</div></td><td></td><td>" + signString + "</td><td><strong>" + leadEq + "</strong></td><td></td><td><div id='outdistbtn' class='ui-btn ui-icon-info ui-btn-icon-notext ui-corner-all'></div></td></tr>";
                    }
                    answertext[answertext.length] = "<tr class='outcomedist'><td colspan = 6 style='padding-bottom:10px;'><strong>W:</strong> " + Number(Outcome[1][PPosition][i].PlainW).toFixed(1) + " (" + Number(Outcome[1][PPosition][i].GammonW).toFixed(1) + ", " + Number(Outcome[1][PPosition][i].BackgammonW).toFixed(1) + ") &nbsp;&nbsp;--&nbsp;&nbsp;&nbsp;<strong>L:</strong> " + Number(Outcome[1][PPosition][i].PlainL).toFixed(1) + " (" + Number(Outcome[1][PPosition][i].GammonL).toFixed(1) + ", " + Number(Outcome[1][PPosition][i].BackgammonL).toFixed(1) + ")</td></td></tr>"
                }
                else{
                    var eqDiff = Play[PPosition][0].PlayEquity - Play[PPosition][i].PlayEquity
                    var eqDiffFixed = eqDiff.toFixed(3); 
                    var textColor = "" // Default will change with theme 
                    if (eqDiff > .01) {textColor = "green"} //#009933"}
                    if (eqDiff > .10) {textColor = "red"} //#FF0000"}
                    
					answertext[answertext.length] = "<tr><td></td><td><div class='ui-btn ui-mini ui-icon-carat-r ui-btn-icon-right ui-corner-all movebutton' style='width:70%;text-align:left;margin:3px'>" + Play[PPosition][i].PlayString + "</div></td><td></td><td style='color:" + textColor + "'>(-</td><td style='color:" + textColor + "'>" + eqDiffFixed + ')</td></tr>';
                    answertext[answertext.length] = "<tr class='outcomedist'><td colspan = 6 style='padding-bottom:10px;'><strong>W:</strong> " + Number(Outcome[1][PPosition][i].PlainW).toFixed(1) + " (" + Number(Outcome[1][PPosition][i].GammonW).toFixed(1) + ", " + Number(Outcome[1][PPosition][i].BackgammonW).toFixed(1) + ") &nbsp;&nbsp;--&nbsp;&nbsp;&nbsp;<strong>L:</strong> " + Number(Outcome[1][PPosition][i].PlainL).toFixed(1) + " (" + Number(Outcome[1][PPosition][i].GammonL).toFixed(1) + ", " + Number(Outcome[1][PPosition][i].BackgammonL).toFixed(1) + ")</td></td></tr>"
                }
        }
		
        return (answertext)
    }


    function getMoneyPlayPosition(){  
    // Looping through PlayCard[chosencard.CardID]) is not needed.  
    // Proper data structure has only one or two entries -- Money and (perhaps) Score.
    // With data convention that Score (if there) always comes first, this function is just:
    // PlayCard[chosencard.CardID][1]    

        for (var key in PlayCard[chosencard.CardID]){
            if (PlayPosition[PlayCard[chosencard.CardID][key]].Score1 == 0){
                return(PlayCard[chosencard.CardID][key])
            }
        }
    }

    function showConceptAnswer(){
        answertext = [];

        if (chosenposition.Concepttype == "TP"){
            answertext[answertext.length] = "<table><tr><td width='100'></td><td width='150'></td><td></td></tr>";

            answertext[answertext.length] = "<tr><td><b>Take Point:</b></td><td><b>Dead Cube</b></td><td><b>Live Cube</b></td></tr>";
            answertext[answertext.length] = "<tr><td></td><td>" + chosenposition.Dead + "%</td><td>" + chosenposition.Live + "%</td></tr></table>";
        }
        else if (chosenposition.Concepttype == "MWC"){
            answertext[answertext.length] = "<table><tr><td width='100'></td><td width='150'></td><td></td></tr>";

            answertext[answertext.length] = "<tr><td><b>MWC:</b></td><td>" + chosenposition.Dead + "%</td><td></td></tr></table>";
        }
        
        return(answertext);
    }

    function showRuleAnswer(){
        answertext = [];
        
        answertext[answertext.length] = "<table width='90%'><tr><td width='25'></td><td></td></tr>";
        answertext[answertext.length] = "<tr><td></td><td><b>" + chosenposition.RuleText + "</b></td></tr><tr><td colspan='100'><hr></td></tr><tr></tr>"

        for (i = 0; i < chosenposition.Subrules.length; i++) {
            answertext[answertext.length] = "<tr><td style='vertical-align:top'><b>" + String.fromCharCode(65 + i) + ".</b></td><td style='vertical-align:top'>" + chosenposition.Subrules[i] + "</td></tr>"
        }

        answertext[answertext.length] = "</table>";
        return(answertext);
    }

    function chooseposition(){
        if (chosencard.CardKind == 0){
            chosenposition = jQuery.extend(true, {}, CubePosition[CubeCard[chosencard.CardID][0]]);
            chosenposition.positionIndex = CubeCard[chosencard.CardID][0];
            $("#swapButton").show();
        }

        else if (chosencard.CardKind == 1){
            chosenposition = jQuery.extend(true, {}, PlayPosition[PlayCard[chosencard.CardID][0]]);
            chosenposition.positionIndex = PlayCard[chosencard.CardID][0];
            $("#swapButton").hide();  
        }

        else if (chosencard.CardKind == 2){
            chosenposition = jQuery.extend(true, {}, ConceptCard[chosencard.CardID]);
            chosenposition.positionIndex = chosencard.CardID;
        }

        else if (chosencard.CardKind == 3){
            chosenposition = jQuery.extend(true, {}, RuleCard[chosencard.CardID]);
            chosenposition.positionIndex = chosencard.CardID;
        }
        return
    }
    
    function browsecard(){
        chosencard = {};
        randomcard = Math.floor(Math.random() * browselist.length);
        chosencard = jQuery.extend(true, {}, browselist[randomcard]);
        return
    }


    function choosecard(){

        do {
           //Pick train group.  Then pick specific card.
            traingroup = choosegroup();
            chosencard = {};

            if (traingroup == "Unseen"){
                randomcard = Math.floor(Math.random() * unseencount);
                chosencard = jQuery.extend(true, {}, currentcards[0][randomcard]);
            }

            else if (traingroup == "Learned"){
                randomcard = Math.floor(Math.random() * learnedcount);
                chosencard = jQuery.extend(true, {}, currentcards[7][randomcard]);
            }

            else {  // Training
                var tickets = [];
                tickets[0] = 0;
                var ticket = 0;
                
                for (var i=1; i<7; i++) {
                    tickets[i] = tickets[i-1] + (currentcards[i].length * (7 - i));  // Gives 6 tickets to group 1; 5 to group 2; etc.
                }

                ticket = Math.floor( (Math.random() * tickets[6]) + 1); // Picks a ticket

                for (var i=1; i<7; i++) {
                    if (ticket <= tickets[i]){
                        randomcard = Math.floor(Math.random() * currentcards[i].length);
                        chosencard = jQuery.extend(true, {}, currentcards[i][randomcard]);
                        break;
                    }
                }       
            }
        }
        while (chosencard.CardID == lastcard)
        return
    }

    function choosegroup(){
        traingroup = "";
        unseencount = currentcards[0].length;
        learnedcount = currentcards[7].length;
        trainingcount = 0;

        for (var i=1; i<7; i++){
            trainingcount = trainingcount + currentcards[i].length;
        }

        if (unseencount == 0){
            if (trainingcount == 0){
                if (learnedcount == 0){
					$("body").pagecontainer("change", "#checkbox");
                }
                
                else {   // learnedcount =/= 0
                    traingroup = "Learned";
                }
            }
            
            else {  // trainingcount =/= 0
                if (learnedcount == 0){
                    traingroup = "Training";
                }
                
                else { // learnedcount =/= 0  95% Training 5% Learned
                    if (Math.random() < .95){
                        traingroup = "Training";
                    }

                    else {
                        traingroup = "Learned";
                    } 
                }
            }
        }

        else {  // Unseen =/= 0
            if (trainingcount < trainingsizelow){
                traingroup = "Unseen";
            }

            else if (trainingcount < trainingsizehigh){  // 50% Training 50% Unseen
                if (Math.random() < .5){
                    traingroup = "Training";
                }

                else {
                    traingroup = "Unseen";
                } 
            }

            else { // Trainincount <= trainingsizehigh
                if (learnedcount == 0){
                    traingroup = "Training";
                }

                else {  // 95% Training 5% Learned
                    if (Math.random() < .95){
                        traingroup = "Training";
                    }

                    else {
                        traingroup = "Learned";
                    }
                }
            }
        }
        return(traingroup);
    }

    function iseasy(){
		if (checkerTweenActive) return;
        oldtrainval = chosencard.trainval;

        if (chosencard.trainval == 7) {   // Cant go higher 
            newtrainval = chosencard.trainval;
        }

        else {
            if (browseMode == false){
                if (chosencard.trainval == 0){newtrainval = 3}
                else {newtrainval = chosencard.trainval + 1} ;
                currentcards[chosencard.trainval][randomcard].trainval = newtrainval;
                currentcards[newtrainval].push(currentcards[chosencard.trainval][randomcard]);  // Adds updated card to updated group
                currentcards[oldtrainval].splice(randomcard, 1);  // Removes card from old group
            }
            else { // if browsemode
                if(chosencard.trainval == 0){newtrainval = chosencard.trainval;}
                else {newtrainval = chosencard.trainval + 1;}   
            }
            localStorage["train" + chosencard.CardID] = "" + newtrainval;            
        }

        if (browseMode) browseResult() 
        else loadCard();
        return
    }

    function ishard(){
		if (checkerTweenActive) return;
        oldtrainval = chosencard.trainval;
		
        if (chosencard.trainval == 1) {  // Can't go lower
            newtrainval = chosencard.trainval;
        }

        else {
            if (chosencard.trainval == 7) {
                newtrainval = 3;  // Learned card drops down to middle of pack
            }

            else if (chosencard.trainval == 0) {
                if (browseMode == true) {newtrainval = 0}
                else {newtrainval = 1;} // Must leave 0 since now seen
            }

            else {
                newtrainval = chosencard.trainval - 1;
            }
            
            localStorage["train" + chosencard.CardID] = "" + newtrainval;
            
            if (browseMode == false){
                currentcards[chosencard.trainval][randomcard].trainval = newtrainval;
                currentcards[newtrainval].push(currentcards[chosencard.trainval][randomcard]);  // Adds updated card to updated group
                currentcards[oldtrainval].splice(randomcard, 1);  // Removes card from old group
            }
        }
        if (browseMode) browseResult() 
        else loadCard();
        return
    }

    function isunsure() {
		if (checkerTweenActive) return;
        oldtrainval = chosencard.trainval;
        
        if (chosencard.trainval == 0) {  // Can't stay at 0
            if (browseMode == true){newtrainval = 0}
            else {
                newtrainval = 1;
                localStorage["train" + chosencard.CardID] = "" + newtrainval;
            }
        }
        else if (chosencard.trainval == 7){
            newtrainval = 6
            localStorage["train" + chosencard.CardID] = "" + newtrainval;            
        }    
        else {newtrainval = chosencard.trainval;}

        if (browseMode == false){
            currentcards[chosencard.trainval][randomcard].trainval = newtrainval;
            currentcards[newtrainval].push(currentcards[chosencard.trainval][randomcard]);  // Adds updated card to updated group
            currentcards[oldtrainval].splice(randomcard, 1);  // Removes card from old group
        }
        if (browseMode) browseResult() 
        else loadCard();
        return
    }

    function browseResult(){
        browselist.splice(randomcard,1);
        if (browselist.length == 0){
			$("body").pagecontainer("change", "#deckselect");
            $("#deckselect").on("pagecontainershow" , function() {
                $("#AllBrowsedPopup").popup("open", {positionTo: 'window'});
            });
        }

        else loadCard();
        return
    }

    function animate(playStringText){
        if (undoFlag == true){
			if (checkerTweenActive) return; // ignore undos if checkers moving
            undo();
        }
        else{
            parsedPS = []
            parsedPS = parsePlayString(playStringText);
            for (var i=0; i<parsedPS.length; i++){
                bglog.move(parsedPS[i].FromPoint, parsedPS[i].ToPoint, 1)
            }
            undoFlag = true
        }
        return

    }

    function undo(){
		bglog.undoMove();
        $('.movebutton').removeClass('ui-disabled')
		$('.movebutton').removeClass("ui-icon-carat-l");
		$('.movebutton').addClass("ui-icon-carat-r");
        undoFlag = false
        return
    }

    function parsePlayString(pStr){
        var playMultiplier = 1
        var pStr1 = pStr.replace(/bar/gi, "25"); //Convert "Bar"
        var pStr2 = pStr1.replace(/off/gi, "0"); //Convert "Off"
        var pStr3 = pStr2.replace(/\*/gi, "").trim();  //Remove "*"  .trim removes trailing space.
        var playSplit = pStr3.split(" ");  //  playSplit[0] = 13/11;  playSplit[1] = 6/5
        var moveSplit = [];
        
        for (var i=0; i<playSplit.length; i++){
            moveSplit[i] = playSplit[i].split("/"); //moveSplit[0][0] = 13; moveSplit[0][1] = 11
            
            if (moveSplit[i][1].indexOf("(") > -1){
                var playMultiplierIndex = moveSplit[i][1].indexOf("(")
                playMultiplier = Number(moveSplit[i][1][playMultiplierIndex + 1])
                var slicedMove = moveSplit[i][1].slice(0, playMultiplierIndex)
                moveSplit[i][1] = slicedMove
            }
            else playMultiplier = 1
             
            for (var j = 0; j < playMultiplier; j++){
                parsedPS[parsedPS.length] = new makeParsedPS(Number(moveSplit[i][0])-1, Number(moveSplit[i][1])-1)
            }
        }
        return (parsedPS);
    }

    function makeParsedPS(FromPoint, ToPoint){
        this.FromPoint = FromPoint;
        this.ToPoint = ToPoint;
        return
    }

    function fbswap(){
		if (swapSidesFlag) {
			$('#swapButton').removeClass("ui-icon-back");
			$('#swapButton').addClass("ui-icon-forward");
		} else {
			$('#swapButton').removeClass("ui-icon-forward");
			$('#swapButton').addClass("ui-icon-back");
		}
        bglog.swapSides();
        return;
    }

    function clearLS(){
        window.localStorage.clear();
    }


    function openHint(){
		$("body").pagecontainer("change", "#hint" + chosencard.hintlist[0], {transition: "slide"});
    }

    function openStore(){

        $("body").pagecontainer("change", "#store", {transition: "pop"});

        if (sessionStorage.storeInit != "Initialized"){
            initStore();    // Starts ecommerce protocols
        } 
    }

    function manageFav(){
        if (fave.indexOf('Card' + chosencard.CardID) > -1){  // If card is Fav
            fave.splice(fave.indexOf('Card' + chosencard.CardID),1)
            localStorage.fave = "" + fave.toString()
            $('#favButton').removeClass('ui-alt-icon');
            $('#addFavMessage').hide(250)
            $('#remFavMessage').show(250)            
            checkFavorites()             
        }
        else {
            fave.push("Card" + chosencard.CardID);
            localStorage.fave = "" + fave.toString(); 
            $('#favButton').addClass('ui-alt-icon');
            $('#addFavMessage').show(250)            
            $('#remFavMessage').hide(250)

            checkFavorites() 
        }
    }

    function otherHeaderFunction(){
        var current = $( ".ui-page-active" ).jqmData( "title" );
        if (current.indexOf("Hint") !=-1) {
            $("body").pagecontainer("change", "#" + hintOrigin, {transition: "slide", reverse: "true"} );                        
        }

        else if (current == "Stats"){
            $("body").pagecontainer("change", "#deckselect", {transition: "pop", reverse: "true"} );
        }
        else if (current == "Flashcard"){
            compareFlag = true
            showStats("Compare")
        }

        else {
            $("body").pagecontainer("change", "#" + pageBeforeSettings, {transition: "pop", reverse: "true"} );            
        }
    }

    function infoHeaderFunction(){
        $("body").pagecontainer("change", "#Help", {transition: "pop"});
        var current = $( ".ui-page-active" ).jqmData( "title" );
        if (current == "Select Deck") $( "#sdHelp" ).collapsible( "expand" );
        else if (current == "Stats")  $( "#stHelp" ).collapsible( "expand" );
        else if (current == "Flashcard") {
            if (showingAnswer) $( "#flashA" ).collapsible( "expand" ); 
            else $( "#flashQ" ).collapsible( "expand" );
        }
        else if (current == "Settings") $( "#setHelp" ).collapsible( "expand" ); 
        else {
            $( "#setHelp" ).collapsible( "expand" );
            $( "#setHelp" ).collapsible( "collapse" );
        }
    }


    // Dynamically changes the theme of all UI elements on all pages,
    // also pages not yet rendered (enhanced) by jQuery Mobile.
    function changeGlobalTheme(theme)
    {
        // These themes will be cleared, add more
        // swatch letters as needed.
        var themes = " a b c d e";

        // Updates the theme for all elements that match the
        // CSS selector with the specified theme class.
        function setTheme(cssSelector, themeClass, theme)
        {
            $(cssSelector)
                .removeClass(themes.split(" ").join(" " + themeClass + "-"))
                .addClass(themeClass + "-" + theme)
                .attr("data-theme", theme);
        }

        // Add more selectors/theme classes as needed.
        setTheme(".ui-mobile-viewport", "ui-overlay", theme);
        setTheme("[data-role='page']", "ui-body", theme);
        setTheme("[data-role='page']", "ui-page-theme", theme);        
        setTheme("[data-role='page']", "ui-overlay-theme", theme);        
        setTheme("[data-role='header']", "ui-bar", theme);
        setTheme("[data-role='footer']", "ui-bar", theme);
        setTheme("[data-role='collapsibleset']", "ui-bar", theme);                        
        setTheme("[data-role='listview'] > li", "ui-bar", theme);
        setTheme(".ui-page", "background", theme);
        setTheme(".ui-btn", "ui-btn-up", theme);
        setTheme(".ui-btn", "ui-btn-hover", theme);
        setTheme("[data-role='panel']", "ui-panel-page-container", theme);
        setTheme("[data-role='panel']", "ui-panel-page-content", theme);
    };

};  // end on device ready function
