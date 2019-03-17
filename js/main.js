// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');

// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);

  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};

// Obtain configured instance.
var serviveuuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
 
var CHARACTERISTIC_UUID_RX = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
var CHARACTERISTIC_UUID_TX = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

console.log("Service uuid: " + serviveuuid.toLowerCase());
console.log("CHARACTERISTIC_UUID_RX: " + CHARACTERISTIC_UUID_RX.toLowerCase());

const terminal = new BluetoothTerminal(serviveuuid.toLowerCase(),CHARACTERISTIC_UUID_TX.toLowerCase(),
'\n','\n');

function ConnectW(ssid)
{
  window.alert('connect to ' + ssid);
}

function ClearWifiTable()
{
  var Parent = document.getElementById('ScanTable');
  Parent.getElementsByTagName("tbody")[0].innerHTML = "";
}

function AddWifiTableRow(name)
{

  //name = document.getElementById('sid').value;//tmp
  var tableRef = document.getElementById('ScanTable').getElementsByTagName('tbody')[0];

  // Insert a row in the table at the last row
  var newRow   = tableRef.insertRow(tableRef.rows.length);
  //newRow.id = "id_" + name;
  newRow.setAttribute("id","id_" + name);
  newRow.setAttribute("onclick", "ConnectW(\""+name+"\");");
  
  //newRow.onclick=Connect();
  
  // Insert a row at the end of the table : var newCell = tableRef.insertRow(-1);
  // Insert a cell in the row at index 0 
  var newCell  = newRow.insertCell(0);

  // Append a text node to the cell
  var newText  = document.createTextNode(name);
  newCell.appendChild(newText);
}

//AddWifiTableRow("Test1");
//AddWifiTableRow("Test2");

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function(data) {
   
  ClearWifiTable();
  
  var json = JSON.parse(data);
  //logToTerminal("Parsing\n",'in');
  //logToTerminal("JSON parsed " + json +"\n",'in');
  
  document.getElementById("WifiSSID").style = "display:block";
  
  //clear table rows
  //var Table = document.getElementById("WifiSSID");
  //Table.innerHTML = "";
  
  for (var i = 0; i < json.length; i++) {
    var object = json[i];
    AddWifiTableRow(object.ssid);
  }
  
  
};

// Override default log method to output messages to the terminal and console.
terminal._log = function(...messages) {
  // We can't use `super._log()` here.
  messages.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {
  terminal.send(data).
      then(() => logToTerminal(data, 'out')).
      catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  terminal.connect().
      then(() => {
        deviceNameLabel.textContent = terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName;
      });
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
