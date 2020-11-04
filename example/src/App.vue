<template>
	<container :questionData="data"></container>
</template>

<script>
import Container from "./components/Container.vue";

export default {
	name: "app",
	data() {
		return {
			data: {
				answers: [
					{
						text: "Option 1",
						order: 1,
						groupName: ""
					},
					{
						text: "Option 2",
						order: 2,
						groupName: ""
					},
					{
						text: "Option 3",
						order: 3,
						groupName: ""
					},
					{
						text: "Option 4",
						order: 4,
						groupName: ""
					}
				]
			}
		};
	},
	components: {
		Container
	}
};
</script>

<style lang="scss">
</style>
