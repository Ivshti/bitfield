var fs = require("fs");

var Container = typeof Buffer !== "undefined" ? Buffer //in node, use buffers
		: typeof Int8Array !== "undefined" ? Int8Array //in newer browsers, use webgl int8arrays
		: function(l){ var a=new Array(l); for(var i=0;i<l;i++)a[i]=0; }; //else, do something similar

function BitField(data, persist){
	if(!(this instanceof BitField)) {
		return new BitField(data, persist);
	}

	this.persist = persist;
	if (persist) try { this.buffer = fs.readFileSync(persist); return; } catch(e) { };

	if(typeof data === "number"){
		if(data % 8 !== 0) data += 1 << 3;
		data = new Container(data >> 3);
		if(data.fill) data.fill(0); // clear node buffers of garbage
	}
	this.buffer = data;
}

BitField.prototype.get = function(i){
	return !!(this.buffer[i >> 3] & (128 >> (i % 8)));
};

BitField.prototype.set = function(i, b){
	if(b || arguments.length === 1){
		this.buffer[i >> 3] |= 128 >> (i % 8);
	} else {
		this.buffer[i >> 3] &= ~(128 >> (i % 8));
	}

	var self = this;
	if (this.persist) { 
		if (persistTimeout) clearTimeout(persistTimeout); 
		persistTimeout = setTimeout(function() { self.persist() }, 100);
	} 
};

var persistTimeout;
BitField.prototype.persist = function() {
	fs.writeFile(this.persist, this.buffer, function(err) { 
		if (err) console.error(err) 
	});
};

if(typeof module !== "undefined") module.exports = BitField;
