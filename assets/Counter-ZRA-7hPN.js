import{d as e}from"./piecesjs-B79wdN2z.js";class u extends e{constructor(){super("Counter")}mount(){console.log("mount Counter"),this.$button=this.$("button")[0],this.on("click",this.$button,this.click)}unmount(){console.log("unmount Counter"),this.off("click",this.$button[0],this.click)}render(){return`
		  <h2>${this.name} component</h2>
		  <p>Value: ${this.value}</p>
		  <button class="c-button">Increment</button>
		`}click(){this.value=parseInt(this.value)+1}set value(t){return this.setAttribute("value",t)}get value(){return this.getAttribute("value")}static get observedAttributes(){return["value"]}}customElements.define("c-counter",u);
