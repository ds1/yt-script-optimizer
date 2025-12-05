// YT-Script-Optimizer MCP Server
// Optimizes video scripts for SEO keyword integration and engagement

const WebSocket = require('ws');

class YTScriptOptimizer {
  constructor() {
    this.name = 'YT-Script-Optimizer';
    this.version = '1.0.0';
    this.capabilities = ['youtube', 'script', 'keywords', 'optimization'];
    this.port = process.env.PORT || 3000;

    // Script structure recommendations
    this.scriptStructure = {
      hook: { duration: '0-15 seconds', purpose: 'Grab attention, state value proposition' },
      intro: { duration: '15-45 seconds', purpose: 'Introduce topic, establish credibility' },
      body: { duration: 'Main content', purpose: 'Deliver value, integrate keywords naturally' },
      cta: { duration: '15-30 seconds', purpose: 'Call to action, engagement prompts' },
      outro: { duration: '10-20 seconds', purpose: 'Summarize, tease next video' }
    };

    // Engagement phrases
    this.engagementPhrases = {
      hook: [
        'In this video, you\'ll learn',
        'Have you ever wondered',
        'What if I told you',
        'The biggest mistake people make is',
        'Here\'s something most people don\'t know about'
      ],
      transition: [
        'Now let\'s talk about',
        'Moving on to',
        'Here\'s where it gets interesting',
        'The next important point is',
        'Let me show you'
      ],
      engagement: [
        'Let me know in the comments',
        'Drop a like if you agree',
        'Subscribe for more',
        'What do you think about',
        'Share this with someone who needs it'
      ],
      retention: [
        'Stay until the end for',
        'I\'ll reveal the secret at',
        'Keep watching to discover',
        'The best tip is coming up',
        'Don\'t miss what\'s next'
      ]
    };
  }

  start() {
    const wss = new WebSocket.Server({ port: this.port });

    wss.on('connection', (ws) => {
      console.log(`[${new Date().toISOString()}] Client connected`);

      ws.on('message', async (message) => {
        try {
          const request = JSON.parse(message.toString());
          console.log(`[${new Date().toISOString()}] Received:`, request.method);

          const response = await this.handleRequest(request);
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32700, message: 'Parse error' },
            id: null
          }));
        }
      });

      ws.on('close', () => {
        console.log(`[${new Date().toISOString()}] Client disconnected`);
      });
    });

    console.log(`🚀 ${this.name} MCP server running on port ${this.port}`);

    if (process.env.REPLIT_ENVIRONMENT === 'production') {
      console.log(`📡 Published WebSocket URL: wss://yt-script-optimizer-agt.replit.app`);
    } else {
      console.log(`📡 Dev WebSocket URL: ws://localhost:${this.port}`);
    }
  }

  async handleRequest(request) {
    const { method, params, id } = request;

    switch(method) {
      case 'ping':
        return this.handlePing(id);

      case 'tools/list':
        return this.handleToolsList(id);

      case 'tools/call':
        return await this.handleToolCall(params, id);

      default:
        return {
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id
        };
    }
  }

  handlePing(id) {
    return {
      jsonrpc: '2.0',
      result: {
        status: 'ok',
        agent: this.name,
        version: this.version,
        timestamp: new Date().toISOString()
      },
      id
    };
  }

  handleToolsList(id) {
    return {
      jsonrpc: '2.0',
      result: {
        tools: [
          {
            name: 'optimizeScript',
            description: 'Optimize a video script for SEO and engagement',
            inputSchema: {
              type: 'object',
              properties: {
                script: {
                  type: 'string',
                  description: 'The video script to optimize'
                },
                concept: {
                  type: 'string',
                  description: 'The video concept/topic'
                },
                keywords: {
                  type: 'object',
                  description: 'Keywords data from analyzer'
                },
                targetDuration: {
                  type: 'number',
                  description: 'Target video duration in minutes',
                  default: 10
                },
                contentStyle: {
                  type: 'string',
                  enum: ['tutorial', 'review', 'vlog', 'educational', 'entertainment'],
                  description: 'Style of content'
                },
                optimizationLevel: {
                  type: 'string',
                  enum: ['light', 'moderate', 'aggressive'],
                  default: 'moderate',
                  description: 'How much to modify the script'
                }
              },
              required: ['script', 'concept']
            }
          }
        ]
      },
      id
    };
  }

  async handleToolCall(params, id) {
    const { name, arguments: args } = params;

    if (name !== 'optimizeScript') {
      return {
        jsonrpc: '2.0',
        error: { code: -32602, message: `Unknown tool: ${name}` },
        id
      };
    }

    try {
      const result = await this.optimizeScript(args);
      return {
        jsonrpc: '2.0',
        result: {
          content: result
        },
        id
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message },
        id
      };
    }
  }

  async optimizeScript({
    script,
    concept,
    keywords,
    targetDuration = 10,
    contentStyle = 'tutorial',
    optimizationLevel = 'moderate'
  }) {
    if (!script || !concept) {
      throw new Error('Script and concept are required');
    }

    console.log(`Optimizing script for: "${concept}"`);

    // Extract keywords
    const primaryKeywords = keywords?.recommended?.primary?.map(k => k.keyword) || [concept];
    const secondaryKeywords = keywords?.recommended?.secondary?.map(k => k.keyword) || [];
    const longTailKeywords = keywords?.recommended?.longTail?.map(k => k.keyword) || [];
    const allKeywords = [...primaryKeywords, ...secondaryKeywords, ...longTailKeywords];

    // Analyze original script
    const originalAnalysis = this.analyzeScript(script, allKeywords);

    // Generate optimizations
    const optimizations = this.generateOptimizations(
      script,
      allKeywords,
      contentStyle,
      optimizationLevel
    );

    // Generate optimized script
    const optimizedScript = this.applyOptimizations(
      script,
      optimizations,
      primaryKeywords,
      contentStyle
    );

    // Analyze optimized script
    const optimizedAnalysis = this.analyzeScript(optimizedScript, allKeywords);

    // Generate script structure recommendations
    const structureRecommendations = this.generateStructureRecommendations(
      script,
      targetDuration,
      contentStyle
    );

    // Generate engagement suggestions
    const engagementSuggestions = this.generateEngagementSuggestions(
      script,
      contentStyle
    );

    return {
      concept,
      contentStyle,
      targetDuration,
      optimizationLevel,
      generatedAt: new Date().toISOString(),
      original: {
        script: script,
        analysis: originalAnalysis
      },
      optimized: {
        script: optimizedScript,
        analysis: optimizedAnalysis
      },
      improvements: {
        keywordDensityChange: (optimizedAnalysis.keywordDensity - originalAnalysis.keywordDensity).toFixed(2),
        keywordsAdded: optimizedAnalysis.keywordsFound - originalAnalysis.keywordsFound,
        engagementPointsAdded: optimizations.engagementPoints?.length || 0
      },
      optimizations: optimizations.changes,
      structureRecommendations,
      engagementSuggestions,
      keywordInsertions: this.suggestKeywordInsertions(script, primaryKeywords, secondaryKeywords),
      tips: this.getScriptTips(contentStyle),
      warnings: this.generateWarnings(optimizedAnalysis)
    };
  }

  analyzeScript(script, keywords) {
    const words = script.split(/\s+/).filter(w => w.length > 0);
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = script.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Count keyword occurrences
    let keywordCount = 0;
    const keywordOccurrences = {};

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = script.match(regex);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        keywordOccurrences[keyword] = count;
        keywordCount += count;
      }
    });

    // Calculate reading time (average 150 words per minute for speaking)
    const estimatedDuration = Math.ceil(words.length / 150);

    // Check for engagement elements
    const hasQuestion = /\?/.test(script);
    const hasCallToAction = /subscribe|like|comment|share/i.test(script);
    const hasHook = sentences[0]?.length < 100;

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      averageSentenceLength: Math.round(words.length / sentences.length),
      estimatedDuration: `${estimatedDuration} minutes`,
      keywordsFound: Object.keys(keywordOccurrences).length,
      keywordOccurrences,
      totalKeywordMentions: keywordCount,
      keywordDensity: ((keywordCount / words.length) * 100).toFixed(2),
      engagementElements: {
        hasQuestion,
        hasCallToAction,
        hasHook,
        questionCount: (script.match(/\?/g) || []).length
      },
      readabilityScore: this.calculateReadability(script)
    };
  }

  calculateReadability(script) {
    const words = script.split(/\s+/).filter(w => w.length > 0);
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;

    // Simplified Flesch-Kincaid
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllables);

    let level;
    if (score >= 80) level = 'very easy';
    else if (score >= 60) level = 'easy';
    else if (score >= 40) level = 'moderate';
    else if (score >= 20) level = 'difficult';
    else level = 'very difficult';

    return { score: Math.round(score), level };
  }

  countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let count = 0;
    let prevWasVowel = false;

    for (const char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !prevWasVowel) count++;
      prevWasVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  }

  generateOptimizations(script, keywords, contentStyle, level) {
    const changes = [];
    const engagementPoints = [];

    // Determine how aggressive to be
    const intensity = { light: 1, moderate: 2, aggressive: 3 }[level] || 2;

    // Check for keyword opportunities in first paragraph
    const firstParagraph = script.split(/\n\n/)[0] || '';
    const primaryKeyword = keywords[0];

    if (primaryKeyword && !firstParagraph.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      changes.push({
        type: 'keyword_insertion',
        location: 'opening',
        suggestion: `Add "${primaryKeyword}" to your opening to improve SEO`,
        priority: 'high'
      });
    }

    // Check for engagement opportunities
    if (!script.includes('?')) {
      changes.push({
        type: 'engagement',
        location: 'throughout',
        suggestion: 'Add questions to increase viewer engagement',
        priority: 'medium'
      });
      engagementPoints.push({ type: 'question', suggested: true });
    }

    // Check for call to action
    if (!/subscribe|like|comment/i.test(script)) {
      changes.push({
        type: 'cta',
        location: 'middle and end',
        suggestion: 'Add calls to action (subscribe, like, comment)',
        priority: 'high'
      });
    }

    // Check keyword density
    const words = script.split(/\s+/).length;
    const keywordMentions = keywords.reduce((count, kw) => {
      const regex = new RegExp(kw, 'gi');
      return count + (script.match(regex) || []).length;
    }, 0);
    const density = (keywordMentions / words) * 100;

    if (density < 1 && intensity >= 2) {
      changes.push({
        type: 'keyword_density',
        location: 'throughout',
        suggestion: `Keyword density is ${density.toFixed(2)}%. Aim for 1-2%`,
        priority: 'medium'
      });
    }

    // Check for hook
    const firstSentence = script.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 150) {
      changes.push({
        type: 'hook',
        location: 'opening',
        suggestion: 'Shorten your opening hook - aim for under 150 characters',
        priority: 'high'
      });
    }

    // Style-specific recommendations
    if (contentStyle === 'tutorial' && !/step|first|next|then|finally/i.test(script)) {
      changes.push({
        type: 'structure',
        location: 'throughout',
        suggestion: 'Add step markers (First, Next, Then, Finally) for tutorials',
        priority: 'medium'
      });
    }

    return { changes, engagementPoints };
  }

  applyOptimizations(script, optimizations, primaryKeywords, contentStyle) {
    let optimizedScript = script;
    const primaryKeyword = primaryKeywords[0];

    // Add hook if missing (prepend to script)
    const hookPhrases = this.engagementPhrases.hook;
    const sentences = script.split(/(?<=[.!?])\s+/);

    if (sentences[0]?.length > 150 && primaryKeyword) {
      const hook = `${hookPhrases[Math.floor(Math.random() * hookPhrases.length)]} ${primaryKeyword}. `;
      optimizedScript = hook + optimizedScript;
    }

    // Add keyword to first paragraph if missing
    const paragraphs = optimizedScript.split(/\n\n/);
    if (primaryKeyword && paragraphs[0] && !paragraphs[0].toLowerCase().includes(primaryKeyword.toLowerCase())) {
      const firstParagraphSentences = paragraphs[0].split(/(?<=[.!?])\s+/);
      if (firstParagraphSentences.length > 1) {
        firstParagraphSentences[1] = `When it comes to ${primaryKeyword}, ` + firstParagraphSentences[1].charAt(0).toLowerCase() + firstParagraphSentences[1].slice(1);
        paragraphs[0] = firstParagraphSentences.join(' ');
        optimizedScript = paragraphs.join('\n\n');
      }
    }

    // Add engagement question if none exists
    if (!optimizedScript.includes('?')) {
      const midPoint = Math.floor(optimizedScript.length / 2);
      const insertPoint = optimizedScript.indexOf('.', midPoint);
      if (insertPoint !== -1) {
        const question = `\n\nWhat do you think about ${primaryKeyword || 'this'}? Let me know in the comments.\n\n`;
        optimizedScript = optimizedScript.slice(0, insertPoint + 1) + question + optimizedScript.slice(insertPoint + 1);
      }
    }

    // Add CTA if missing
    if (!/subscribe|like|comment/i.test(optimizedScript)) {
      optimizedScript += '\n\nIf you found this helpful, don\'t forget to like this video and subscribe for more content like this!';
    }

    return optimizedScript;
  }

  generateStructureRecommendations(script, targetDuration, contentStyle) {
    const words = script.split(/\s+/).length;
    const estimatedMinutes = Math.ceil(words / 150);

    const recommendations = [];

    // Duration check
    if (estimatedMinutes < targetDuration * 0.8) {
      recommendations.push({
        section: 'overall',
        issue: `Script is short (${estimatedMinutes} min) for ${targetDuration} min target`,
        suggestion: 'Add more detail, examples, or sections to reach target duration'
      });
    } else if (estimatedMinutes > targetDuration * 1.2) {
      recommendations.push({
        section: 'overall',
        issue: `Script is long (${estimatedMinutes} min) for ${targetDuration} min target`,
        suggestion: 'Trim unnecessary content or split into multiple videos'
      });
    }

    // Structure recommendations by content style
    const structureGuide = {
      tutorial: ['Introduction', 'Prerequisites/Setup', 'Step-by-step instructions', 'Tips & Tricks', 'Conclusion'],
      review: ['Introduction', 'Overview/Unboxing', 'Features', 'Pros & Cons', 'Verdict'],
      educational: ['Hook', 'Context', 'Main concepts', 'Examples', 'Summary'],
      entertainment: ['Hook', 'Setup', 'Main content', 'Payoff', 'Outro'],
      vlog: ['Intro', 'Main activities', 'Highlights', 'Reflection', 'Outro']
    };

    recommendations.push({
      section: 'structure',
      suggestion: `Recommended structure for ${contentStyle}:`,
      sections: structureGuide[contentStyle] || structureGuide.tutorial
    });

    return recommendations;
  }

  generateEngagementSuggestions(script, contentStyle) {
    const suggestions = [];

    // Retention hooks
    suggestions.push({
      type: 'retention',
      timing: '30 seconds in',
      suggestion: 'Add a pattern interrupt or tease what\'s coming ("Stay until the end for...")',
      examples: this.engagementPhrases.retention.slice(0, 2)
    });

    // Mid-roll engagement
    suggestions.push({
      type: 'engagement',
      timing: 'middle of video',
      suggestion: 'Ask a question or request interaction',
      examples: this.engagementPhrases.engagement.slice(0, 2)
    });

    // Transition phrases
    suggestions.push({
      type: 'transitions',
      timing: 'between sections',
      suggestion: 'Use clear transition phrases to maintain flow',
      examples: this.engagementPhrases.transition.slice(0, 2)
    });

    // Hook suggestions
    suggestions.push({
      type: 'hook',
      timing: 'first 15 seconds',
      suggestion: 'Start with a strong hook that creates curiosity',
      examples: this.engagementPhrases.hook.slice(0, 2)
    });

    return suggestions;
  }

  suggestKeywordInsertions(script, primaryKeywords, secondaryKeywords) {
    const suggestions = [];
    const sentences = script.split(/(?<=[.!?])\s+/);

    // Suggest primary keyword insertions
    primaryKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const count = (script.match(regex) || []).length;

      if (count < 3) {
        suggestions.push({
          keyword,
          currentCount: count,
          recommendedCount: '3-5',
          locations: [
            'Opening sentence',
            'Middle of content',
            'Conclusion'
          ]
        });
      }
    });

    // Suggest secondary keyword insertions
    secondaryKeywords.slice(0, 3).forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const count = (script.match(regex) || []).length;

      if (count < 1) {
        suggestions.push({
          keyword,
          currentCount: count,
          recommendedCount: '1-2',
          locations: ['Body content']
        });
      }
    });

    return suggestions;
  }

  getScriptTips(contentStyle) {
    const commonTips = [
      'Speak naturally - keyword stuffing sounds robotic',
      'Use keywords in questions to sound more natural',
      'Mention your primary keyword in the first 30 seconds for YouTube SEO',
      'Repeat key points for retention',
      'Use "you" language to connect with viewers'
    ];

    const styleTips = {
      tutorial: [
        'Number your steps clearly',
        'Pause after important points',
        'Acknowledge common mistakes'
      ],
      review: [
        'Be honest about drawbacks',
        'Compare to alternatives',
        'Give a clear recommendation'
      ],
      educational: [
        'Start with why it matters',
        'Use analogies and examples',
        'Summarize key takeaways'
      ]
    };

    return [...commonTips, ...(styleTips[contentStyle] || [])];
  }

  generateWarnings(analysis) {
    const warnings = [];

    if (parseFloat(analysis.keywordDensity) > 3) {
      warnings.push({
        type: 'keyword_stuffing',
        message: `Keyword density (${analysis.keywordDensity}%) is too high - may sound unnatural`
      });
    }

    if (analysis.averageSentenceLength > 25) {
      warnings.push({
        type: 'readability',
        message: 'Average sentence length is high - consider breaking up long sentences'
      });
    }

    if (!analysis.engagementElements.hasCallToAction) {
      warnings.push({
        type: 'missing_cta',
        message: 'No clear call to action found - add subscribe/like reminders'
      });
    }

    return warnings;
  }
}

// Start the server
const server = new YTScriptOptimizer();
server.start();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing WebSocket server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing WebSocket server');
  process.exit(0);
});
