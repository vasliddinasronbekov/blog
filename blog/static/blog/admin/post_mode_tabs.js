(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function findFieldRow(fieldName) {
    return qs('.form-row.field-' + fieldName) || qs('.field-' + fieldName);
  }

  function setFieldsetMuted(fieldset, muted) {
    if (!fieldset) return;
    fieldset.classList.toggle('mode-muted', muted);
  }

  function setFieldsetsMuted(fieldsets, muted) {
    fieldsets.forEach(function (fieldset) {
      setFieldsetMuted(fieldset, muted);
    });
  }

  function getModeValue() {
    var checked = qs('input[name="generation_mode"]:checked');
    return checked ? checked.value : 'manual';
  }

  function setCheckedMode(radios, mode) {
    radios.forEach(function (radio) {
      radio.checked = radio.value === mode;
    });
  }

  function renderTabs(modeContainer) {
    var wrapper = document.createElement('div');
    wrapper.className = 'post-mode-tabs';

    var manualBtn = document.createElement('button');
    manualBtn.type = 'button';
    manualBtn.className = 'post-mode-tab';
    manualBtn.setAttribute('data-mode', 'manual');
    manualBtn.textContent = 'Manual';

    var aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.className = 'post-mode-tab';
    aiBtn.setAttribute('data-mode', 'ai');
    aiBtn.textContent = 'AI';

    wrapper.appendChild(manualBtn);
    wrapper.appendChild(aiBtn);

    modeContainer.parentNode.insertBefore(wrapper, modeContainer);
    return wrapper;
  }

  function setMode(mode, radios, tabs, aiFieldsets, manualFieldsets) {
    setCheckedMode(radios, mode);

    qsa('.post-mode-tab', tabs).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    setFieldsetsMuted(aiFieldsets, mode !== 'ai');
    setFieldsetsMuted(manualFieldsets, mode !== 'manual');
  }

  function getCookie(name) {
    var cookies = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  }

  function setValueAndTrigger(id, value) {
    var field = qs('#' + id);
    if (!field) return;
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent || 'Generate';
    }
    button.disabled = isLoading;
    button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    button.textContent = isLoading ? 'Generating...' : button.dataset.defaultText;
    button.classList.toggle('is-loading', isLoading);
  }

  function setStatus(statusEl, level, lines) {
    if (!statusEl) return;
    statusEl.className = 'ai-generate-status ai-generate-status-' + level;

    var safeLines = Array.isArray(lines) ? lines.filter(Boolean) : [String(lines || '')];
    statusEl.innerHTML = safeLines
      .map(function (line) {
        return '<div class=\"ai-generate-line\">' + line + '</div>';
      })
      .join('');
  }

  function initGenerateAction(radios, tabs, aiFieldsets, manualFieldsets) {
    var button = qs('#ai-generate-btn');
    var status = qs('#ai-generate-status');
    if (!button) return;

    button.addEventListener('click', function () {
      if (button.disabled) return;

      var url = button.getAttribute('data-url');
      var topic = (qs('#id_ai_topic') && qs('#id_ai_topic').value.trim()) || '';
      var keywords = (qs('#id_ai_keywords') && qs('#id_ai_keywords').value.trim()) || '';
      var tone = (qs('#id_ai_tone') && qs('#id_ai_tone').value.trim()) || '';
      var startedAt = Date.now();

      if (!topic) {
        setStatus(status, 'error', [
          'Validation failed: topic is required.',
          'Fix: enter AI topic and click Generate again.',
        ]);
        return;
      }

      setMode('ai', radios, tabs, aiFieldsets, manualFieldsets);
      setButtonLoading(button, true);
      setStatus(status, 'pending', [
        'Validating input...',
        'Sending request to backend AI endpoint...',
      ]);

      var controller = new AbortController();
      var timeoutId = setTimeout(function () {
        controller.abort();
      }, 180000);

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        signal: controller.signal,
        body: JSON.stringify({
          topic: topic,
          keywords: keywords,
          tone: tone,
        }),
      })
        .then(function (response) {
          setStatus(status, 'pending', [
            'Backend responded.',
            'Parsing AI output payload...',
          ]);
          return response
            .text()
            .catch(function () {
              return '';
            })
            .then(function (bodyText) {
              var data = {};
              try {
                data = bodyText ? JSON.parse(bodyText) : {};
              } catch (e) {
                data = {};
              }

              if (!response.ok) {
                var detail = data.error || 'Generation failed.';
                var hint = data.hint ? 'Hint: ' + data.hint : '';
                throw new Error('HTTP ' + response.status + ': ' + detail + (hint ? ' | ' + hint : ''));
              }
              return data;
            });
        })
        .then(function (data) {
          setStatus(status, 'pending', [
            'AI content received.',
            'Applying generated content to form fields...',
          ]);
          setValueAndTrigger('id_title', data.title || '');
          setValueAndTrigger('id_content', data.content || '');
          setValueAndTrigger('id_seo_title', data.seo_title || '');
          setValueAndTrigger('id_seo_description', data.seo_description || '');
          setValueAndTrigger('id_seo_keywords', data.seo_keywords || '');
          var seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
          setStatus(status, 'success', [
            'Generation complete in ' + seconds + 's.',
            'Fields updated: title, content, SEO title, description, keywords.',
            'Next step: review content and click Save.',
          ]);
        })
        .catch(function (err) {
          if (err && err.name === 'AbortError') {
            setStatus(status, 'error', [
              'Generation timed out after 180s.',
              'Fix: try a shorter topic/keywords or retry.',
            ]);
            return;
          }
          setStatus(status, 'error', [
            'Generation failed.',
            err && err.message ? err.message : 'Unknown error.',
          ]);
        })
        .finally(function () {
          clearTimeout(timeoutId);
          setButtonLoading(button, false);
        });
    });
  }

  function init() {
    var modeRow = findFieldRow('generation_mode');
    if (!modeRow) return;

    var radios = qsa('input[name="generation_mode"]', modeRow);
    if (!radios.length) return;

    var aiTopicRow = findFieldRow('ai_topic');
    var manualRows = [findFieldRow('title'), findFieldRow('content'), findFieldRow('seo_title')].filter(Boolean);

    if (!aiTopicRow || !manualRows.length) return;

    var aiFieldset = aiTopicRow.closest('fieldset');
    var manualFieldsets = [];
    manualRows.forEach(function (row) {
      var fieldset = row.closest('fieldset');
      if (fieldset && manualFieldsets.indexOf(fieldset) === -1) {
        manualFieldsets.push(fieldset);
      }
    });

    var tabs = renderTabs(modeRow);
    modeRow.classList.add('mode-radio-hidden');

    tabs.addEventListener('click', function (e) {
      var tabBtn = e.target.closest('.post-mode-tab');
      if (!tabBtn) return;
      setMode(tabBtn.getAttribute('data-mode'), radios, tabs, [aiFieldset], manualFieldsets);
    });

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        setMode(getModeValue(), radios, tabs, [aiFieldset], manualFieldsets);
      });
    });

    setMode(getModeValue(), radios, tabs, [aiFieldset], manualFieldsets);
    initGenerateAction(radios, tabs, [aiFieldset], manualFieldsets);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
