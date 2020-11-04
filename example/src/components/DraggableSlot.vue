<template>
	<div class="simple-row">
		<div
			:style="getRowStyle"
			:id="id"
			@mouseup="setMoving(false)"
			@mousedown="setMoving"
			v-on:click="fakeDoubleClick(item, $event)"
			class="board"
		>
			<draggable-item
				:id="id"
				:class="dragAreaClass"
				:list="list"
				disabledClass="rowDisabled"
				containerClass="card"
				draggingClass="draggedItem"
				parentContainerClass="questionCard"
				additionalTransition="rotate(3deg)"
				:item="item"
				:answerSlot="isYourAnswer"
				:group="group"
				@start="onStart"
				@change="onChange"
				@end="onEnd"
				:ref="id"
			>
				<div :id="id" v-for="(item,index) in list" :key="index" style="pointer-events:none">
					<div class="row align-items-center text-container">
						<slot />
						<div class="col-sm-12 col-md-9 text-center d-table pl-md-1 pl-lg-0">
							<div v-if="!isClicked" class="d-table-cell align-middle">{{item.text}}</div>
							<div v-else class="d-table-cell align-middle">
								<i style="color:#f27b79; font-size:40px;" class="fad fa-times"></i>
								<p style="font-size:10px; margin-bottom:0">click again to remove</p>
							</div>
						</div>
					</div>
				</div>
			</draggable-item>
		</div>
	</div>
</template>
<script>
// import draggableItem from "./DraggableItem";
export default {
	name: "draggable-slot",
	props: {
		isYourAnswer: {
			type: Boolean,
			default: false
		},
		isShowingClose: {
			type: Boolean,
			default: false
		},
		dragStarted: {
			type: Boolean,
			default: null
		},
		itemsToDisable: {
			type: Array,
			default: () => {
				return [];
			}
		},
		groupName: {
			type: String,
			default: null
		},
		groupPut: {
			type: [Function, String]
		},
		item: {
			type: Object,
			default: () => {
				return null;
			}
		},
		id: {
			type: String
		},
		addGroupName: {
			type: Boolean,
			default: false
		},
		onAddAction: {
			type: Function,
			default: () => {}
		},
		toHide: {
			type: Array,
			default: () => {
				return [];
			}
		},
		choiceToHighlight: {
			type: String,
			default: null
		}
	},
	// components: {
	// 	draggableItem
	// },
	data() {
		return {
			list: [],
			isMoving: false,
			isClicked: false
		};
	},
	computed: {
		canViewCloseButton() {
			return this.isYourAnswer;
		},
		isIOS() {
			return (
				!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
			);
		},
		isDisabled() {
			if (this.item !== null)
				return this.itemsToDisable.includes(this.item.order);
			else return false;
		},
		group() {
			if (this.item !== null)
				return {
					name: this.groupName ? this.groupName : this.item.groupName,
					put: this.groupPut
				};
			else {
				return {
					put: this.groupPut
				};
			}
		},
		hideContent() {
			return this.toHide.includes(this.id);
		},
		isAnswer() {
			return this.isYourAnswer;
		},
		isDragArea() {
			if (this.item !== null && this.choiceToHighlight === this.item.groupName)
				return true;
			else return this.isAnswer && this.dragStarted;
		},
		dragAreaClass() {
			return (
				(this.isDragArea ? "dragArea" : null) ||
				(this.isDisabled ? "rowDisabled" : null)
			);
		},
		getRowStyle() {
			let style = {};
			if (this.list.length !== 0 && !this.isDisabled) {
				if (this.isMoving) {
					style.cursor = [
						"pointer",
						"-webkit-grabbing",
						"-moz-grabbing",
						"grabbing"
					];
				} else {
					style.cursor = ["move", "-webkit-grab", "-moz-grab", "grab"];
				}
			}
			return style;
		}
	},
	watch: {
		isShowingClose(newVal, oldVal) {
			this.isClicked = false;
		},
		item: {
			handler(newVal, oldVal) {
				this.addTextToArray();
			}
		},
		deep: true
	},
	mounted() {
		this.addTextToArray();
	},
	methods: {
		removeAnswer(item, event) {
			let change = {
				removed: {
					element: item,
					oldIndex: 0
				}
			};
			this.onChange(change);
		},
		fakeDoubleClick(item, event) {
			if (this.canViewCloseButton) {
				if (this.isClicked) this.removeAnswer(item, event);
				this.$emit("fake");
				setTimeout(() => (this.isClicked = !this.isClicked), 10);
				setTimeout(() => (this.isClicked = false), 3000);
			}
		},
		addTextToArray() {
			this.list.splice(0, this.list.length);
			if (this.item !== null) {
				if (this.addGroupName) this.item.groupName = this.groupName;
				this.list.push(this.item);
			}
		},
		onEnd(a) {
			this.isMoving = false;
			this.$emit("end");
		},
		onChange(a) {
			if (Object.keys(a).includes("added")) {
				a.added.element = this.item;
				let newItemIndex = a.added.newIndex;
				let addedItem = a.added.element;
				let oldItem = this.list[newItemIndex === 0 ? 1 : 0];
				this.list.splice(newItemIndex === 0 ? 1 : 0, 1);
				this.onAddAction(addedItem, oldItem, a.added.to);
				if (this.isClicked) this.isClicked = false;
			} else if (Object.keys(a).includes("removed")) {
				a.removed.element = this.item;
				if (this.isClicked) this.isClicked = false;
				this.$emit("remove", a.removed.element, this.id);
			}
		},
		onStart(a) {
			this.$emit("start", a);
		},
		onMove(a) {
			this.$emit("move", a);
		},
		setMoving(value = true) {
			this.isMoving = value;
		},
		addTextToArray() {
			this.list.splice(0, this.list.length);
			if (this.item !== null) {
				if (this.addGroupName) this.item.groupName = this.groupName;
				this.list.push(this.item);
			}
		},
		deleteAnswer: e => {
			let heh = e.target.id;
			let dupa = document.getElementById(heh.replace("card", "answer"));
			dupa.appendChild(e.target);
		},
		changeOpacity: e => {
			e.target.classList.remove("draggedItem");
			const card_id = e.dataTransfer.getData("card_id");
			const card = document.getElementById(card_id);
			e.srcElement.offsetParent.classList.remove("questionCard");
			card.style.opacity = "1";
		}
	}
};
</script>
<style>
</style>