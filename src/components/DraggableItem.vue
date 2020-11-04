<template>
	<div style="user-select:none; " :id="id" :class="this.containerClass">
		<slot />
	</div>
</template>
<script>
export default {
	props: {
		id: {
			type: String
		},

		list: {
			type: Array
		},
		group: {
			type: Object
		},
		item: {
			type: Object,
			default: () => {
				return null;
			}
		},
		disabledClass: {
			type: String,
			required: true
		},
		containerClass: {
			type: String,
			required: true
		},
		parentContainerClass: {
			type: String,
			required: true
		},
		draggingClass: {
			type: String
		},
		additionalTransition: {
			type: String,
			default: ""
		},
		answerSlot: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			el: null,
			dragging: false,
			dragFrom: null,
			offsetX: null,
			offsetY: null
		};
	},
	computed: {
		isMobile() {
			return typeof window.orientation !== "undefined";
		}
	},
	mounted() {
		if (this.isMobile) {
			this.$el.addEventListener("touchstart", this.startDrag);
			window.addEventListener("touchend", this.stopDrag);
		} else {
			this.$el.addEventListener("mousedown", this.startDrag);
			window.addEventListener("mouseup", this.stopDrag);
		}
	},
	methods: {
		replaceAnswer(id) {
			this.addAnswer(id);
			this.removeAnswer();
		},
		removeAnswer() {
			this.$emit("change", {
				removed: {
					element: this.item,
					to: this.group.name,
					oldIndex: 0
				}
			});
		},
		addAnswer(id) {
			this.$emit("change", {
				added: {
					element: this.item,
					to: id,
					newIndex: 0
				}
			});
		},
		containsClass(target, className) {
			return target.classList.contains(className);
		},
		startDrag(e) {
			let target = e.target;
			if (
				!this.containsClass(target, this.disabledClass) &&
				target.children.length > 0
			) {
				let shiftX = 0,
					shiftY = 0;
				target.offsetParent.classList.add(this.parentContainerClass);
				let clonedTarget = target.cloneNode(true);
				target.parentElement.appendChild(clonedTarget);
				document.body.style.cursor = "no-drop";
				this.dragging = true;
				this.dragFrom = target.id;
				if (this.isMobile) {
					target.offsetParent.ontouchmove = this.doDrag;

					var testEl = e.target;
					while (
						testEl &&
						!isNaN(testEl.offsetLeft) &&
						!isNaN(testEl.offsetTop)
					) {
						shiftX += testEl.offsetLeft - testEl.scrollLeft;
						shiftY += testEl.offsetTop - testEl.scrollTop;
						testEl = testEl.offsetParent;
					}
					shiftX = e.touches[0].clientX - shiftX;
					shiftY = e.touches[0].pageY - shiftY;
					clonedTarget.style.top = `${e.touches[0].clientY - shiftX}px`;
					clonedTarget.style.left = `${e.touches[0].clientX - shiftY}px`;
					this.offsetY = shiftX;
					this.offsetX = shiftY;
				} else {
					target.offsetParent.onmousemove = this.doDrag;
					clonedTarget.style.top = `${e.clientY - e.layerY}px`;
					clonedTarget.style.left = `${e.clientX - e.layerX}px`;
					this.offsetY = e.layerY;
					this.offsetX = e.layerX;
					// var testEl = e.target;
					// while (
					// 	testEl &&
					// 	!isNaN(testEl.offsetLeft) &&
					// 	!isNaN(testEl.offsetTop)
					// ) {
					// 	shiftX += testEl.offsetLeft - testEl.scrollLeft;
					// 	shiftY += testEl.offsetTop - testEl.scrollTop;
					// 	testEl = testEl.offsetParent;
					// 	console.log(shiftX, shiftY);
					// }
					// console.log(e);
					// shiftX = e.clientX - shiftX;
					// shiftY = e.pageY - shiftY;
					// clonedTarget.style.top = `${e.clientY - shiftX}px`;
					// clonedTarget.style.left = `${e.clientX - shiftY}px`;
					// this.offsetY = shiftX;
					// this.offsetX = shiftY;
				}
				clonedTarget.classList.add(this.draggingClass);
				clonedTarget.style.width = `${target.offsetWidth}px`;

				if (this.isMobile) clonedTarget.ontouchstart = this.startDrag;
				else clonedTarget.onmousedown = this.startDrag;
				clonedTarget.ondblclick = this.removeAnswer;
				this.el = clonedTarget;
				let dragged = {
					from: {
						id: target.id
					},
					to: {
						id: null
					}
				};
				this.$emit("start", dragged);
			}
		},
		stopDrag(e) {
			let target = e.target;
			document.body.style.cursor = "auto";
			if (this.el) {
				this.dragging = false;
				if (this.isMobile) {
					target = document.elementFromPoint(
						e.changedTouches[0].clientX,
						e.changedTouches[0].clientY
					);
				}
				this.el.parentElement.removeChild(this.el);
				document
					.getElementById(this.dragFrom)
					.offsetParent.classList.remove(this.parentContainerClass);
				this.el.classList.remove(this.draggingClass);
				this.el = null;
				if (target.id === this.dragFrom) {
				} else if (target.id === this.group.name) {
					this.removeAnswer();
				} else if (
					this.answerSlot === true &&
					target.classList.contains(this.containerClass)
				) {
					this.replaceAnswer(target.id);
				} else if (target.classList.contains(this.containerClass)) {
					this.addAnswer(target.id);
				} else {
					this.removeAnswer();
				}
				this.dragFrom = null;
				this.$emit("end", {});
			}
		},
		doDrag(e) {
			if (this.dragging === true) {
				e.preventDefault();
				e.stopPropagation();
				let pointerX, pointerY, clientX, clientY;

				if (this.isMobile) {
					clientX = e.touches[0].clientX;
					clientY = e.touches[0].clientY;
				} else {
					clientX = e.clientX;
					clientY = e.clientY;
				}
				pointerX = clientX - parseInt(this.el.style.left) - this.offsetX;
				pointerY = clientY - parseInt(this.el.style.top) - this.offsetY;

				this.el.style.transform = `translate(${pointerX}px,${pointerY}px) ${this.additionalTransition}`;
			}
		}
	}
};
</script>