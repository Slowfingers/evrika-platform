<script>
  import { TIME_INTERVALS, getIntervalByMinutes } from '$lib/utils/time-intervals.js';
  
  export let selectedMinutes = 5;
  export let onChange = () => {};
  
  // Определяем выбранный интервал на основе текущего значения
  $: selectedInterval = getIntervalByMinutes(selectedMinutes)?.id || TIME_INTERVALS[1].id;
  
  function handleIntervalSelect(interval) {
    selectedMinutes = interval.value;
    onChange(interval.value);
  }
</script>

<div class="time-selector">
  <div class="block text-sm font-medium text-gray-700 mb-3">
    Время выполнения
  </div>
  
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-label="Выбор времени выполнения">
    {#each TIME_INTERVALS as interval}
      <button
        type="button"
        class="time-tab {selectedInterval === interval.id ? 'active' : ''}"
        on:click={() => handleIntervalSelect(interval)}
        aria-label="Выбрать время выполнения: {interval.label}"
        aria-pressed={selectedInterval === interval.id}
      >
        <div class="time-icon">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <span class="time-label">{interval.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .time-selector {
    width: 100%;
  }
  
  .time-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
    cursor: pointer;
    min-height: 80px;
    gap: 6px;
  }
  
  .time-tab:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  .time-tab.active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
  
  .time-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f1f5f9;
    transition: all 0.2s ease;
  }
  
  .time-tab.active .time-icon {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .time-tab:hover .time-icon {
    background: #e0f2fe;
  }
  
  .time-label {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
  }
  
  .time-tab.active .time-label {
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    .time-tab {
      padding: 10px 6px;
      min-height: 70px;
    }
    
    .time-icon {
      width: 28px;
      height: 28px;
    }
    
    .time-label {
      font-size: 11px;
    }
  }
</style>
