<template>
	<div>
		<div class="question-card">
			<div class="question-card-body">
				<div class="leftSide" :key="index" v-for="(item,index) in answers">
					<draggable-slot
						:items-to-disable.sync="idsToDisable"
						:item="item"
						@end="clearFlags(true)"
						:groupName=" questionGroup +  index.toString()"
						:groupPut="choicesPut"
						:addGroupName="true"
						:onAddAction="replace"
						:id="choicesIds[index]"
						:toHide="toHide"
						:dragStarted="dragStarted"
						@start="startDrag"
						:choiceToHighlight="choiceToHighlight"
					></draggable-slot>
				</div>
				<div
					class="rightSide"
					:style="{gridRow:test+1}"
					v-for="(list,index,test) in lists"
					:key="`list-${index}`"
				>
					<draggable-slot
						:id="index"
						:onAddAction="replace"
						:item="lists[index][0]"
						:groupPut="answersPut"
						:toHide="toHide"
						@end="clearFlags(true)"
						@remove="handleRemove"
						@start="startDrag"
						:dragStarted="dragStarted"
						:isYourAnswer="true"
					></draggable-slot>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import draggableSlot from "./DraggableSlot";
export default {
	name: "container",
	props: {
		questionData: {
			type: Object,
			required: true
		}
	},
	components: {
		draggableSlot
	},
	data() {
		return {
			answers: {},
			lists: {},
			draggedFrom: null,
			toHide: [],
			componentsAreReady: true,
			answerGroups: [],
			questionGroup: "",
			dragStarted: false,
			choiceToHighlight: null
		};
	},
	created() {
		this.answers = this.questionData.answers.sort((a, b) =>
			a.order > b.order ? 1 : -1
		);
		this.questionGroup = this.generateGroup();
		for (let index = 0; index < this.questionData.answers.length; index++)
			this.answerGroups.push(index.toString());
		this.lists = Object.assign({}, this.answerData.lists, true);
		this.sendDataToParent();
	},
	methods: {
		fillWithAnswers(answers) {
			let listOfPossibleAnswers = this.questionData.answers.map(answer => {
				return answer;
			});
			for (let list of Object.keys(this.lists)) {
				let yourAnswer = listOfPossibleAnswers.find(i => {
					if (answers[list].order) {
						return i.order === parseInt(answers[list].order);
					} else return i.singleValue === answers[list].singleValue;
				});
				this.lists[list].push(yourAnswer);
			}
		},
		choicesPut(to, from) {
			return to.options.group.name === from.options.group.name;
		},
		answersPut(to, from) {
			return (
				from.options.group.name.includes(this.questionGroup) ||
				this.isAnswerIds(from.options.group.name)
			);
		},
		replace(item, oldItem, itemId) {
			if (oldItem !== undefined && !this.choicesIds.includes(this.draggedFrom))
				this.replaceBetweenAnswers(oldItem);
			this.lists[itemId].splice(0, this.lists[itemId].length);
			this.lists[itemId].push(item);
			this.sendDataToParent();
		},
		sendDataToParent() {
			let data = {};
			Object.keys(this.lists).forEach(listName => {
				data[listName] = this.lists[listName];
			});
			this.$emit("input", data);
		},
		replaceBetweenAnswers(oldItem) {
			this.componentsAreReady = false;
			let itemToRemove = this.lists[this.draggedFrom].findIndex(
				e => e.id !== oldItem
			);
			this.lists[this.draggedFrom].splice(itemToRemove, 1);
			this.lists[this.draggedFrom].push(oldItem);
			this.$nextTick(() => {
				this.componentsAreReady = true;
			});
		},
		clearAll() {
			for (let list in this.lists)
				this.lists[list].splice(0, this.lists[list].length);
			this.isShowingClose = false;
			this.clearFlags();
		},
		clearFlags(dragIsEnded = false) {
			this.draggedFrom = null;
			this.draggedTo = null;
			this.toHide = [];
			if (dragIsEnded) {
				this.dragStarted = false;
				this.choiceToHighlight = null;
			}
		},
		startDrag(dragged) {
			this.dragStarted = true;
			let from = dragged.from.id;
			this.draggedFrom = from;
			if (this.isAnswerIds(from)) {
				this.choiceToHighlight = this.lists[from][0].groupName;
			}
		},
		isAnswerIds(toId) {
			return Object.keys(this.lists).includes(toId);
		},
		handleRemove(removedItem, id) {
			let itemIndex = this.lists[id].findIndex(
				o => o.order === removedItem.order
			);
			if (itemIndex > -1) this.lists[id].splice(itemIndex, 1);
		},
		generateGroup(length = 6) {
			let text = "";
			let possible =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for (var i = 0; i < length; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		},
		refreshGroupNames() {
			for (let index = 0; index < this.answerGroups.length; index++) {
				let isAnswer = false;
				for (let list in this.lists) {
					let listName = list;
					let toFind = this.questionGroup + index;
					if (
						this.lists[listName].findIndex(o => o.groupName === toFind) > -1
					) {
						this.answerGroups[index] = toFind;
						isAnswer = true;
					}
					if (!isAnswer) this.answerGroups[index] = index.toString();
				}
			}
		}
	},
	computed: {
		idsToDisable() {
			let ids = [];
			for (let list in this.lists) {
				this.lists[list].map(el => {
					ids.push(el.order);
				});
			}
			return ids;
		},
		answerData() {
			return {
				lists: {
					first: [],
					second: []
				}
			};
		},
		choicesIds() {
			let ids = [];
			for (let i = 0; i < this.questionData.answers.length; i++)
				ids.push(this.questionGroup + i.toString());
			return ids;
		}
	},
	watch: {
		lists: {
			handler(value) {
				this.refreshGroupNames();
			},
			deep: true
		},
		questionData() {
			this.answers = this.questionData.answers.sort((a, b) =>
				a.order > b.order ? 1 : -1
			);
		}
	}
};
</script>

<style lang="scss">
</style>