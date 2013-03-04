var foo=4;

document.write('<p>script</p>');

var xhr = new XMLHttpRequest();
/*xhr.onload= function(event) {
    window.alert('loaded '+xhr.responseText);
}*/
xhr.open('GET', 'hello.txt', false);
xhr.send();