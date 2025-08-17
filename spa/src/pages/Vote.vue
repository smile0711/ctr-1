<!-- 
  This is a single-file Vue 2 component.
  To use it, you'll need a Vue 2 project set up (e.g., via Vue CLI).
  You would also need a library that provides this.$http, like vue-resource.
  And Tailwind CSS configured in your project.
-->
<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 text-white">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">Voting Board</h1>
      <div>
        <button @click="openPollModal" class="btn-primary font-semibold py-2 px-4 rounded-lg shadow-md">
          New Poll
        </button>
      </div>
    </header>

    <!-- Main two-pane layout -->
    <div class="flex flex-col space-y-4" style="height: 75vh;">
      <!-- Top Pane: Polls List -->
      <div class="glass-panel p-4 flex-grow flex flex-col h-1/2">
        <h2 class="text-xl font-semibold mb-3 flex-shrink-0">Polls</h2>
        <div v-if="isLoading" class="text-center py-10 flex-grow flex items-center justify-center">
          <p>Loading Polls...</p>
        </div>
        <div v-else class="space-y-3 overflow-y-auto">
          <div v-if="!polls.length" class="text-center text-gray-400 py-4">
            No polls have been created yet.
          </div>
          <div v-for="poll in polls" :key="poll.id" @click="selectPoll(poll.id)" 
               class="p-3 rounded-lg cursor-pointer transition-all duration-200"
               :class="selectedPoll && selectedPoll.id === poll.id ? 'bg-indigo-700/50 border border-indigo-500' : 'bg-gray-700/30 hover:bg-gray-700/60 border border-transparent'">
            <h3 class="font-bold text-md">{{ poll.title }}</h3>
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>Created by: {{ poll.createdBy.slice(0, 12) }}...</span>
              <span>{{ getTotalVotes(poll) }} total votes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Pane: Selected Poll Details -->
      <div class="glass-panel p-6 flex-grow h-1/2 flex flex-col">
        <div v-if="!selectedPoll" class="flex items-center justify-center h-full text-gray-400">
          Select a poll to view its details.
        </div>
        <div v-else class="flex flex-col h-full">
            <h2 class="text-2xl font-bold mb-1">{{ selectedPoll.title }}</h2>
            <p class="text-sm text-gray-400 mb-4">Created by: {{ selectedPoll.createdBy.slice(0, 12) }}...</p>
            <p class="text-gray-300 mb-4 flex-shrink-0">{{ selectedPoll.description }}</p>
            
            <div class="overflow-y-auto">
              <h3 class="text-lg font-semibold mb-3">{{ hasVoted ? 'Results' : 'Cast Your Vote' }}</h3>
              <!-- Results View -->
              <div v-if="hasVoted">
                <div v-for="(option, index) in selectedPoll.options" :key="index" class="mb-3">
                  <div class="flex justify-between items-baseline mb-1">
                      <span class="font-medium">{{ option }}</span>
                      <span class="text-sm text-gray-400">{{ getVoteCount(index) }} votes ({{ getPercentage(index) }}%)</span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-2.5">
                      <div class="progress-bar-fill h-2.5 rounded-full" :style="{ width: getPercentage(index) + '%' }"></div>
                  </div>
                </div>
                <p class="text-center text-green-400 mt-4">You have already voted in this poll.</p>
              </div>
              <!-- Voting View -->
              <div v-else>
                <button v-for="(option, index) in selectedPoll.options" :key="index" @click="castVote(index)" :disabled="isVoting" class="vote-btn w-full text-left btn-secondary font-semibold p-3 rounded-lg mb-3">
                  {{ isVoting ? 'Voting...' : option }}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Create Poll Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div @click="closePollModal" class="modal-bg absolute inset-0"></div>
        <div class="glass-panel relative w-full max-w-lg p-6 m-4">
            <h2 class="text-2xl font-bold mb-4">Create a New Poll</h2>
            <form @submit.prevent="createPoll">
                <div class="mb-4">
                    <label for="poll-title" class="block mb-2 text-sm font-medium">Title</label>
                    <input type="text" v-model="newPoll.title" id="poll-title" class="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5" required>
                </div>
                <div class="mb-4">
                    <label for="poll-description" class="block mb-2 text-sm font-medium">Description</label>
                    <textarea v-model="newPoll.description" id="poll-description" rows="3" class="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5"></textarea>
                </div>
                <div id="poll-options-container" class="mb-4 space-y-2">
                    <label class="block mb-2 text-sm font-medium">Options</label>
                    <input v-for="(option, index) in newPoll.options" :key="index" type="text" v-model="newPoll.options[index]" class="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5" :placeholder="'Option ' + (index + 1)" required>
                </div>
                <button type="button" @click="addOption" class="text-sm text-indigo-400 hover:underline mb-6">+ Add another option</button>
                
                <div class="flex justify-end space-x-4">
                    <button type="button" @click="closePollModal" class="btn-secondary font-semibold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" class="btn-primary font-semibold py-2 px-4 rounded-lg">Create</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'VotingBoard',
  data() {
    return {
      isLoading: true,
      isVoting: false,
      isModalOpen: false,
      polls: [],
      selectedPoll: null,
      newPoll: {
        title: '',
        description: '',
        options: ['', ''],
      },
      // This should be retrieved from your app's auth system (e.g., Vuex store)
      currentUserId: 'user-master-account-123', 
    };
  },
  computed: {
    hasVoted() {
      if (!this.selectedPoll || !this.currentUserId) return false;
      return this.selectedPoll.voters && this.selectedPoll.voters.includes(this.currentUserId);
    }
  },
  methods: {
    async fetchPolls() {
      this.isLoading = true;
      try {
        const response = await this.$http.get(`/api/polls`);
        // Sort polls by creation date, newest first
        this.polls = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (error) {
        console.error('Failed to fetch polls:', error);
        alert('Could not load polls.');
      } finally {
        this.isLoading = false;
      }
    },
    async selectPoll(pollId) {
        // If the same poll is clicked again, deselect it.
        if (this.selectedPoll && this.selectedPoll.id === pollId) {
            this.selectedPoll = null;
            return;
        }
        try {
            // In a real-world scenario with many polls, you might want to refetch
            // the specific poll to ensure its data is up-to-date.
            // For this example, we'll find it in the existing list.
            const poll = this.polls.find(p => p.id === pollId);
            if (poll) {
                this.selectedPoll = poll;
            } else {
                // Fallback to fetch if not found in the list for some reason
                const response = await this.$http.get(`/api/polls/${pollId}`);
                this.selectedPoll = response.data;
            }
        } catch (error) {
            console.error(`Failed to fetch poll ${pollId}:`, error);
            alert('Could not load the selected poll.');
        }
    },
    async createPoll() {
      if (this.newPoll.options.some(opt => !opt.trim())) {
        alert('All options must be filled out.');
        return;
      }
      try {
        await this.$http.post(`/api/polls`, {
          ...this.newPoll,
          createdBy: this.currentUserId,
        });
        this.closePollModal();
        this.fetchPolls(); // Refresh the list
      } catch (error) {
        console.error('Failed to create poll:', error);
        alert('Failed to create poll.');
      }
    },
    async castVote(optionIndex) {
      this.isVoting = true;
      try {
        const response = await this.$http.post(`/api/polls/${this.selectedPoll.id}/vote`, {
          optionIndex,
          userId: this.currentUserId,
        });
        this.selectedPoll = response.data;
        // Also update the poll in the main list to reflect new vote counts
        const pollIndex = this.polls.findIndex(p => p.id === this.selectedPoll.id);
        if (pollIndex !== -1) {
            this.$set(this.polls, pollIndex, this.selectedPoll);
        }
      } catch (error) {
        console.error('Failed to cast vote:', error);
        alert(error.response?.data?.message || 'An error occurred while voting.');
      } finally {
        this.isVoting = false;
      }
    },
    openPollModal() {
      this.newPoll = { title: '', description: '', options: ['', ''] };
      this.isModalOpen = true;
    },
    closePollModal() {
      this.isModalOpen = false;
    },
    addOption() {
      this.newPoll.options.push('');
    },
    getTotalVotes(poll) {
      if (!poll.results) return 0;
      return Object.values(poll.results).reduce((sum, count) => sum + count, 0);
    },
    getVoteCount(optionIndex) {
        return this.selectedPoll.results[optionIndex] || 0;
    },
    getPercentage(optionIndex) {
        const total = this.getTotalVotes(this.selectedPoll);
        if (total === 0) return 0;
        const count = this.getVoteCount(optionIndex);
        return ((count / total) * 100).toFixed(1);
    }
  },
  created() {
    this.fetchPolls();
  },
});
</script>

<style scoped>
.glass-panel {
    background: rgba(38, 38, 38, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
}
.btn-primary {
    background-color: #4f46e5;
    color: white;
    transition: background-color 0.3s;
}
.btn-primary:hover {
    background-color: #4338ca;
}
.btn-secondary {
    background-color: #374151;
    color: white;
    transition: background-color 0.3s;
}
.btn-secondary:hover {
    background-color: #4b5563;
}
.progress-bar-fill {
    background-color: #4f46e5;
    transition: width 0.5s ease-in-out;
}
.modal-bg {
    background-color: rgba(0, 0, 0, 0.7);
}
</style>
