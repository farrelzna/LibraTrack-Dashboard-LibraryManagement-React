import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SettingsPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [accentColor, setAccentColor] = useState("#6366f1"); // Default indigo

  const colors = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Emerald", value: "#10b981" },
    { name: "Sky", value: "#0ea5e9" },
    { name: "Violet", value: "#8b5cf6" },
  ];

  const tabs = [
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "integration", label: "Integrations", icon: "🔌" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "accessibility", label: "Accessibility", icon: "♿" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { y: -20, opacity: 0 }
  };

  const slideVariants = {
    hidden: { x: 30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { x: -30, opacity: 0 }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
      style={{ "--accent-color": accentColor }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto p-8"
      >
        {/* Header with animated underline */}
        <div className="space-y-2 mb-12">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-semibold tracking-tight"
          >
            Settings
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "5rem" }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-1 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation with Animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-1"
          >
            <nav className={`space-y-2 sticky top-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
                    ${activeTab === tab.id
                      ? `font-medium ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`
                      : `hover:bg-opacity-50 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-white'}`}`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="ml-auto w-1.5 h-5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Main Content with Tab Animations */}
          <motion.div
            className="lg:col-span-3 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait">
              {activeTab === "notifications" && (
                <motion.section
                  key="notifications"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 transition-colors`}
                >
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span>🔔</span> Notifications
                  </h2>
                  <div className="space-y-6">
                    {[
                      { title: 'Email me when I borrow a book', description: 'Get notified when you successfully borrow a book' },
                      { title: 'Due date reminders', description: 'Receive notifications before your books are due' },
                      { title: 'Monthly report', description: 'Get insights about your library activities' },
                      { title: 'New book arrivals', description: 'Be the first to know when new books are added' },
                      { title: 'System updates', description: 'Stay informed about platform changes' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`flex items-start justify-between py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} last:border-0`}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                          <div
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"
                            style={{ backgroundColor: index < 3 ? accentColor : '' }}
                          />
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {activeTab === "appearance" && (
                <motion.section
                  key="appearance"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 transition-colors`}
                >
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span>🎨</span> Appearance
                  </h2>

                  <div className="space-y-8">
                    {/* Theme Selector */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme</h3>
                      <div className="flex gap-4">
                        <motion.button
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsDark(false)}
                          className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                            ${!isDark ? `border-2 shadow-lg` : 'border-gray-300'}`}
                          style={{ borderColor: !isDark ? accentColor : '' }}
                        >
                          <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-2xl">
                            ☀️
                          </div>
                          <span>Light Mode</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsDark(true)}
                          className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                            ${isDark ? `border-2 shadow-lg` : 'border-gray-300'}`}
                          style={{ borderColor: isDark ? accentColor : '' }}
                        >
                          <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-2xl">
                            🌙
                          </div>
                          <span>Dark Mode</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Accent Color</h3>
                      <div className="relative">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className={`w-full p-3 rounded-lg border flex items-center justify-between ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: accentColor }}></div>
                            <span>Selected Color</span>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.button>

                        <AnimatePresence>
                          {showColorPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`absolute mt-2 w-full p-4 rounded-lg shadow-lg z-10 grid grid-cols-3 gap-3 ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                            >
                              {colors.map((color) => (
                                <motion.button
                                  key={color.value}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setAccentColor(color.value);
                                    setShowColorPicker(false);
                                  }}
                                  className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-opacity-10 hover:bg-black"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full ${accentColor === color.value ? 'ring-2 ring-offset-2' : ''}`}
                                    style={{ backgroundColor: color.value, ringColor: color.value }}
                                  />
                                  <span className="text-xs">{color.name}</span>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Font Size</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{
                            backgroundColor: isDark ? '#374151' : '#E5E7EB',
                            backgroundImage: `linear-gradient(${accentColor}, ${accentColor})`,
                            backgroundSize: '50% 100%',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === "integration" && (
                <motion.section
                  key="integration"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 transition-colors`}
                >
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span>🔌</span> Integrations
                  </h2>

                  <div className="space-y-6">
                    {[
                      { name: 'Google Calendar', status: 'Connected', icon: '📅', description: 'Sync your borrowed books with calendar events' },
                      { name: 'Microsoft Teams', status: 'Not connected', icon: '👥', description: 'Share your reading list with your team' },
                      { name: 'Slack', status: 'Not connected', icon: '💬', description: 'Get notifications in your workspace' },
                      { name: 'Notion', status: 'Not connected', icon: '📝', description: 'Export your reading history to Notion' },
                      { name: 'Goodreads', status: 'Connected', icon: '📚', description: 'Sync your reading progress automatically' }
                    ].map((integration, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`p-5 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="text-2xl mt-1">{integration.icon}</div>
                            <div>
                              <h3 className="font-medium text-lg">{integration.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${integration.status === 'Connected'
                              ? 'bg-opacity-10 bg-red-500 text-red-500'
                              : ''}`}
                            style={{
                              backgroundColor: integration.status !== 'Connected' ? accentColor : '',
                              color: integration.status !== 'Connected' ? 'white' : ''
                            }}
                          >
                            {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                          </motion.button>
                        </div>

                        {integration.status === 'Connected' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">Last synced: Today at 14:32</span>
                              <button className="text-sm underline" style={{ color: accentColor }}>Configure</button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {activeTab === "privacy" && (
                <motion.section
                  key="privacy"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 transition-colors`}
                >
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span>🔒</span> Privacy
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data Collection</h3>

                      {[
                        { title: 'Reading analytics', description: 'Collect data about your reading habits' },
                        { title: 'Search history', description: 'Save your search queries for better recommendations' },
                        { title: 'Usage statistics', description: 'Help us improve by sharing anonymous usage data' }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className={`flex items-start justify-between py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} last:border-0`}
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={index === 0} />
                            <div
                              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"
                              style={{ backgroundColor: index === 0 ? accentColor : '' }}
                            />
                          </label>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      variants={itemVariants}
                      className="mt-8"
                    >
                      <h3 className="text-lg font-medium mb-4">Data Export & Deletion</h3>
                      <div className="flex flex-wrap gap-4">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          Export My Data
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-4 py-2 rounded-lg bg-red-500 bg-opacity-10 text-red-500"
                        >
                          Delete My Account
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.section>
              )}

              {activeTab === "accessibility" && (
                <motion.section
                  key="accessibility"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 transition-colors`}
                >
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span>♿</span> Accessibility
                  </h2>

                  <div className="space-y-8">
                    {/* Motion Preferences */}
                    <motion.div variants={itemVariants} className="space-y-4">
                      <h3 className="text-lg font-medium">Motion</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Reduce animations</p>
                            <p className="text-sm text-gray-500">Minimize motion for those with vestibular disorders</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div
                              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"
                              style={{ backgroundColor: '' }}
                            />
                          </label>
                        </div>
                      </div>
                    </motion.div>

                    {/* Text Options */}
                    <motion.div variants={itemVariants} className="space-y-4">
                      <h3 className="text-lg font-medium">Text</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Text Spacing</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="30"
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              backgroundColor: isDark ? '#374151' : '#E5E7EB',
                              backgroundImage: `linear-gradient(${accentColor}, ${accentColor})`,
                              backgroundSize: '30% 100%',
                              backgroundRepeat: 'no-repeat'
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">High contrast text</p>
                            <p className="text-sm text-gray-500">Increase text contrast for better readability</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div
                              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"
                              style={{ backgroundColor: accentColor }}
                            />
                          </label>
                        </div>
                      </div>
                    </motion.div>

                    {/* Screen Reader */}
                    <motion.div variants={itemVariants} className="space-y-4">
                      <h3 className="text-lg font-medium">Screen Reader</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Optimize for screen readers</p>
                          <p className="text-sm text-gray-500">Improve compatibility with assistive technologies</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"
                            style={{ backgroundColor: accentColor }}
                          />
                        </label>
                      </div>
                    </motion.div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-10"
              style={{ backgroundColor: accentColor }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;