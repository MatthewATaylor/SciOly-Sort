interface Slider {
    name: string;
    continuous: boolean;
}

let sliders: Slider[] = [
    {name: "test", continuous: false},
    {name: "mentor", continuous: false},
    {name: "grade6", continuous: true},
    {name: "grade7", continuous: true},
    {name: "grade8", continuous: true},
    {name: "event", continuous: false},
];

function getSliderValue(slider: HTMLInputElement, continuous: boolean): string {
    return continuous ?
        String(Number(slider.value) / Number(slider.max)) :
        slider.value;
}

for (let i = 0; i < sliders.length; ++i) {
    let sliderInputId = sliders[i].name + "-slider";
    let sliderValueId = sliders[i].name + "-slider-value";

    let sliderInput =
        document.getElementById(sliderInputId) as HTMLInputElement;
    let sliderValue = document.getElementById(sliderValueId);

    //Set initial value
    sliderInput.value = String(Math.floor(Number(sliderInput.max) / 2));
    sliderValue.innerHTML = getSliderValue(sliderInput, sliders[i].continuous);

    //Update value display on input change
    sliderInput.onchange = function() {
        sliderValue.innerHTML = getSliderValue(sliderInput, sliders[i].continuous);
    }
    sliderInput.oninput = function() {
        sliderValue.innerHTML = getSliderValue(sliderInput, sliders[i].continuous);
    }
}
