import * as noUiSlider from 'nouislider';

// Polyfill for matches() from https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
// For browsers that do not support Element.matches() or Element.matchesSelector(), 
// but carry support for document.querySelectorAll(), a polyfill exists:

if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}

// ------ END POLYFILL ------


module.exports = class VictimsFilter{
    constructor(options){
        const app = this;
        
        // Found the nodelist>array trick here --> https://davidwalsh.name/nodelist-array
        app.buttons = [].slice.call(options.buttons);
        app.victims = [].slice.call(options.victims);

        // init the checking/unchecking event handler
        app.buttons.forEach(button => {
            button.addEventListener('click', function(e){
                const checked = button.dataset.checked.toLowerCase();
                this.dataset.checked = checked == "true" ? "false" : "true";
                app.filterVictims();
            })
        });

        const   ageSlider = document.querySelector('#age-slider'),
                sliderLabelLeft = document.querySelector('.age-slider__label--left'),
                sliderLabelRight= document.querySelector('.age-slider__label--right'),
                minAge = parseInt(ageSlider.dataset.minAge),
                maxAge = parseInt(ageSlider.dataset.maxAge);
        
        const slider = noUiSlider.create(ageSlider, {
            start: [minAge, maxAge],
            connect:true,
            behaviour: 'tap-drag',
            direction: 'ltr', 
            range:{
                min: minAge,
                max: maxAge
            }
        });

        slider.on('update', function(values){
            sliderLabelLeft.innerHTML = Math.round(values[0]) == 0 ? "Baby" : Math.round(values[0]);
            app.selectedMinAge = Math.round(values[0]);

            sliderLabelRight.innerHTML = Math.round(values[1]);
            app.selectedMaxAge = Math.round(values[1]);
        })

        slider.on('end', function(){ app.filterVictims() });

        console.log(document.querySelector('.topic--victims .filters'));

        // Initialize click handlers to hide and show the filters;
        document.querySelector('.topic--victims .filters').addEventListener('click', function(e) {
            console.log('click', this);
            this.classList.add('filters--open');
        })

    }

    filterVictims(){

        const app = this;
        console.log('filtering', app.selectedMinAge, app.selectedMaxAge);

        // Find out how many options are checked from each option category
        const   selectedRaces = document.querySelectorAll('.filters__group--race .filter-button[data-checked=true]'),
                selectedCauses = document.querySelectorAll('.filters__group--pub_cause .filter-button[data-checked=true]'), 
                selectedSex = document.querySelectorAll('.filters__group--sex .filter-button[data-checked=true]');
            
        // These arrays will hold the selected categories in the form of css selector strings.
        // BUT, if there are no selections from the category, we want to show ALL, not show NONE.
        let     raceSelectors = selectedRaces.length > 0 ? [] : ["*"],
                causeSelectors = selectedCauses.length > 0 ? [] : ["*"], 
                sexSelectors = selectedCauses.length > 0 ? [] : ["*"];



        // Populate the category arrays with strings representing css selectors that would
        // select that category. Fpr instance, black would be "[data-race='b']"
        for (let i=0; i < selectedRaces.length; i++){
            raceSelectors.push(`[data-${selectedRaces[i].dataset.cat}='${selectedRaces[i].dataset.catValue}']`);
        }

        for (let i=0; i < selectedCauses.length; i++){
            causeSelectors.push(`[data-${selectedCauses[i].dataset.cat}='${selectedCauses[i].dataset.catValue}']`);
        }

        for (let i=0; i < selectedSex.length; i++){
            sexSelectors.push(`[data-${selectedSex[i].dataset.cat}='${selectedSex[i].dataset.catValue}']`);
        }

        console.log(app.victims);
        app.victims.forEach(v => {
            // For each victim ...
            if(v.matches(raceSelectors.toString()) && v.matches(sexSelectors.toString()) && v.matches(causeSelectors.toString())){
                // ... test if it matches our race, sex and cause buttons. Now check the age.
                const age = parseInt(v.dataset.age);
                if (age >= app.selectedMinAge && age <= app.selectedMaxAge){
                    v.style.display = 'block';
                } else {
                    v.style.display = 'none';
                }
            } else {
                // ... otherwise hide it.
                v.style.display = 'none';
            }
        })
    }
}