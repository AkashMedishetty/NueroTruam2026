#!/usr/bin/env node

/**
 * Real-time Multi-User Capacity Monitor
 * Tracks system performance and estimates concurrent user capacity
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class CapacityMonitor {
  constructor() {
    this.startTime = Date.now();
    this.samples = [];
    this.maxSamples = 60; // Keep 1 minute of data (1 sample per second)
    
    // Thresholds for capacity estimation
    this.thresholds = {
      memory: {
        excellent: 0.60,    // <60% memory usage
        good: 0.75,         // <75% memory usage
        warning: 0.85,      // <85% memory usage
        critical: 0.95      // >95% memory usage
      },
      cpu: {
        excellent: 0.50,    // <50% CPU usage
        good: 0.70,         // <70% CPU usage
        warning: 0.85,      // <85% CPU usage
        critical: 0.95      // >95% CPU usage
      }
    };
    
    // User capacity estimates based on resource usage
    this.capacityModel = {
      memoryPerUser: 22, // MB per user (average mixed usage)
      cpuPerUser: 0.02,  // 2% CPU per user
      baseMemory: 1000,  // Base system memory usage (MB)
      baseCpu: 0.20      // Base system CPU usage (20%)
    };
  }

  /**
   * Get current system statistics
   */
  getSystemStats() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = usedMem / totalMem;

    const cpus = os.cpus();
    const cpuCount = cpus.length;
    
    // Calculate CPU usage (approximation)
    const loadAvg = os.loadavg()[0]; // 1-minute load average
    const cpuUsage = Math.min(loadAvg / cpuCount, 1.0);

    return {
      timestamp: Date.now(),
      memory: {
        total: Math.round(totalMem / 1024 / 1024), // MB
        used: Math.round(usedMem / 1024 / 1024),   // MB
        free: Math.round(freeMem / 1024 / 1024),   // MB
        usage: memoryUsage
      },
      cpu: {
        count: cpuCount,
        usage: cpuUsage,
        loadAvg: loadAvg
      },
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch()
    };
  }

  /**
   * Estimate concurrent user capacity based on current resources
   */
  estimateUserCapacity(stats) {
    const availableMemory = stats.memory.total - this.capacityModel.baseMemory;
    const availableCpu = 1.0 - this.capacityModel.baseCpu;

    const memoryBasedCapacity = Math.floor(
      (availableMemory - stats.memory.used) / this.capacityModel.memoryPerUser
    );
    
    const cpuBasedCapacity = Math.floor(
      (availableCpu - stats.cpu.usage) / this.capacityModel.cpuPerUser
    );

    // Take the lower of the two as the limiting factor
    const estimatedCapacity = Math.max(0, Math.min(memoryBasedCapacity, cpuBasedCapacity));
    
    // Determine performance level
    let performanceLevel = 'excellent';
    if (stats.memory.usage > this.thresholds.memory.warning || stats.cpu.usage > this.thresholds.cpu.warning) {
      performanceLevel = 'warning';
    } else if (stats.memory.usage > this.thresholds.memory.good || stats.cpu.usage > this.thresholds.cpu.good) {
      performanceLevel = 'good';
    } else if (stats.memory.usage > this.thresholds.memory.critical || stats.cpu.usage > this.thresholds.cpu.critical) {
      performanceLevel = 'critical';
    }

    return {
      estimated: estimatedCapacity,
      memoryBased: memoryBasedCapacity,
      cpuBased: cpuBasedCapacity,
      limitingFactor: memoryBasedCapacity < cpuBasedCapacity ? 'memory' : 'cpu',
      performanceLevel
    };
  }

  /**
   * Get performance recommendations based on current stats
   */
  getRecommendations(stats, capacity) {
    const recommendations = [];

    if (stats.memory.usage > this.thresholds.memory.warning) {
      recommendations.push({
        type: 'warning',
        category: 'memory',
        message: `High memory usage (${(stats.memory.usage * 100).toFixed(1)}%). Consider upgrading RAM or optimizing memory usage.`
      });
    }

    if (stats.cpu.usage > this.thresholds.cpu.warning) {
      recommendations.push({
        type: 'warning', 
        category: 'cpu',
        message: `High CPU usage (${(stats.cpu.usage * 100).toFixed(1)}%). Consider upgrading CPU or optimizing performance.`
      });
    }

    if (capacity.estimated < 50) {
      recommendations.push({
        type: 'critical',
        category: 'capacity',
        message: `Low user capacity (${capacity.estimated} users). System may struggle with high concurrent load.`
      });
    } else if (capacity.estimated < 100) {
      recommendations.push({
        type: 'warning',
        category: 'capacity', 
        message: `Moderate user capacity (${capacity.estimated} users). Monitor closely during peak usage.`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        category: 'performance',
        message: 'System performance is optimal. Ready for high concurrent user load.'
      });
    }

    return recommendations;
  }

  /**
   * Format and display the monitoring report
   */
  displayReport(stats, capacity, recommendations) {
    const uptime = Math.floor(stats.uptime / 3600);
    
    console.clear();
    console.log('🖥️  NeuroTrauma 2026 - Multi-User Capacity Monitor\n');
    
    // System Overview
    console.log('📊 SYSTEM OVERVIEW');
    console.log('─'.repeat(50));
    console.log(`Platform: ${stats.platform} (${stats.arch})`);
    console.log(`CPU Cores: ${stats.cpu.count}`);
    console.log(`Total Memory: ${stats.memory.total} MB`);
    console.log(`Uptime: ${uptime} hours`);
    console.log();

    // Resource Usage
    console.log('💻 CURRENT RESOURCE USAGE');
    console.log('─'.repeat(50));
    
    // Memory bar
    const memBar = this.createProgressBar(stats.memory.usage, 30);
    const memColor = this.getUsageColor(stats.memory.usage, 'memory');
    console.log(`Memory: ${memColor}${memBar}\x1b[0m ${(stats.memory.usage * 100).toFixed(1)}% (${stats.memory.used}/${stats.memory.total} MB)`);
    
    // CPU bar
    const cpuBar = this.createProgressBar(stats.cpu.usage, 30);
    const cpuColor = this.getUsageColor(stats.cpu.usage, 'cpu');
    console.log(`CPU:    ${cpuColor}${cpuBar}\x1b[0m ${(stats.cpu.usage * 100).toFixed(1)}% (Load: ${stats.cpu.loadAvg.toFixed(2)})`);
    console.log();

    // User Capacity Estimate
    console.log('👥 CONCURRENT USER CAPACITY');
    console.log('─'.repeat(50));
    console.log(`Estimated Capacity: \x1b[1m${capacity.estimated}\x1b[0m concurrent users`);
    console.log(`Memory-based: ${capacity.memoryBased} users`);
    console.log(`CPU-based: ${capacity.cpuBased} users`);
    console.log(`Limiting Factor: ${capacity.limitingFactor.toUpperCase()}`);
    console.log(`Performance Level: ${this.getPerformanceEmoji(capacity.performanceLevel)} ${capacity.performanceLevel.toUpperCase()}`);
    console.log();

    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('─'.repeat(50));
    recommendations.forEach(rec => {
      const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : '🚨';
      console.log(`${icon} ${rec.message}`);
    });
    console.log();

    // Capacity Ranges
    console.log('📈 CAPACITY RANGES');
    console.log('─'.repeat(50));
    console.log(`🟢 Conservative (Excellent): ${Math.floor(capacity.estimated * 0.7)} users`);
    console.log(`🟡 Recommended (Good): ${Math.floor(capacity.estimated * 0.85)} users`);
    console.log(`🟠 Maximum (Acceptable): ${capacity.estimated} users`);
    console.log(`🔴 Burst Only (Critical): ${Math.floor(capacity.estimated * 1.2)} users`);
    console.log();

    console.log(`📊 Monitoring since: ${new Date(this.startTime).toLocaleTimeString()}`);
    console.log(`🔄 Next update in 5 seconds... (Press Ctrl+C to exit)`);
  }

  /**
   * Create a progress bar visualization
   */
  createProgressBar(percentage, width = 20) {
    const filled = Math.floor(percentage * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Get color code based on usage level
   */
  getUsageColor(usage, type) {
    const thresholds = this.thresholds[type];
    if (usage > thresholds.critical) return '\x1b[41m'; // Red background
    if (usage > thresholds.warning) return '\x1b[43m';  // Yellow background
    if (usage > thresholds.good) return '\x1b[42m';     // Green background
    return '\x1b[44m'; // Blue background
  }

  /**
   * Get performance level emoji
   */
  getPerformanceEmoji(level) {
    const emojis = {
      excellent: '🚀',
      good: '✅',
      warning: '⚠️',
      critical: '🚨'
    };
    return emojis[level] || '❓';
  }

  /**
   * Save monitoring data to file
   */
  saveData(stats, capacity) {
    const data = {
      timestamp: stats.timestamp,
      memory: stats.memory,
      cpu: stats.cpu,
      capacity: capacity
    };

    this.samples.push(data);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // Save to file every minute
    if (this.samples.length % 60 === 0) {
      const logFile = path.join(__dirname, '../logs/capacity-monitor.json');
      const logDir = path.dirname(logFile);
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      fs.writeFileSync(logFile, JSON.stringify({
        generatedAt: new Date().toISOString(),
        samples: this.samples
      }, null, 2));
    }
  }

  /**
   * Start monitoring
   */
  start() {
    console.log('🚀 Starting NeuroTrauma 2026 Capacity Monitor...\n');
    
    const monitor = () => {
      try {
        const stats = this.getSystemStats();
        const capacity = this.estimateUserCapacity(stats);
        const recommendations = this.getRecommendations(stats, capacity);
        
        this.saveData(stats, capacity);
        this.displayReport(stats, capacity, recommendations);
        
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    };

    // Run immediately
    monitor();
    
    // Then run every 5 seconds
    const interval = setInterval(monitor, 5000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Stopping capacity monitor...');
      clearInterval(interval);
      console.log('✅ Monitor stopped. Log files saved to ./logs/capacity-monitor.json');
      process.exit(0);
    });
  }
}

// Start monitoring if this file is run directly
if (require.main === module) {
  const monitor = new CapacityMonitor();
  monitor.start();
}

module.exports = CapacityMonitor;