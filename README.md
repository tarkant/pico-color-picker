# 📦 PicoColorPicker (pcp)

PicoColorPicker is a very small color picker focused on simplicity and ease of use.

## How does it work? 🤔

Here is a simple example using the two web components :

```html
<html>
  <body style="display: flex">
    <div style="width: 200px; height: 200px;">
      <pico-color-picker id="colorPicker"></pico-color-picker>
    </div>
    <div style="width: 10px; height: 200px; margin-left: 1rem;">
      <pico-color-palette id="sliderPicker"></pico-slider-vertical>
    </div>

    <script>
        const colorPicker = document.getElementById('colorPicker') as pColorPicker;

        const colorSliderVertical = document.getElementById('sliderPicker') as pColorPalette;

        colorPicker.addEventListener('colorChanged', (ev: CustomEvent) => {
            // Selected color from the square
            console.log(`Selected color is`, ev.detail);
        });

        colorSliderVertical.addEventListener('colorChanged', (ev: CustomEvent) => {
            // Selected base color from the wheel
            colorPicker.baseColor = ev.detail;
        });
    </script>
  </body>
</html>
```

## 🆘 Issues and contributions

If you have an issue or suggestion for this tool, please let me know using the issues.

You can also make a PR if you have any suggestions.

## ⏲ Changelog

- v1.0.0: Initial version with the color palette + color picker web components.
