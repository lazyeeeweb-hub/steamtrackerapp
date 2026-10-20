export interface AndroidFile {
  path: string;
  name: string;
  category: 'manifest' | 'gradle' | 'room' | 'service' | 'viewmodel' | 'compose' | 'activity' | 'capacitor';
  description: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Declares PACKAGE_USAGE_STATS, Foreground Service permissions, Notification channel, and Service components.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.steamwise.tracker">

    <!-- Permission required to access UsageStatsManager to detect active foreground apps -->
    <!-- Note: User must manually grant this in Android Settings via AppOps -->
    <uses-permission
        android:name="android.permission.PACKAGE_USAGE_STATS"
        tools:ignore="ProtectedPermissions" />

    <!-- Foreground service permissions for background playtime tracking -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <!-- Android 14+ requires specific foreground service types -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- Queries package info for installed apps list on Android 11+ (API 30+) -->
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>

    <application
        android:name=".SteamWiseApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SteamWise">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.SteamWise">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Background Playtime Tracking Foreground Service -->
        <service
            android:name=".service.GamePlaytimeTrackerService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Real-time foreground game session duration accumulator" />
        </service>

        <!-- Auto-start service on device reboot if tracking was enabled -->
        <receiver
            android:name=".service.BootReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (app)',
    category: 'gradle',
    description: 'Modern Android Gradle configuration with Jetpack Compose, Room DB, Coroutines, and Coil.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp)
}

android {
    namespace = "com.steamwise.tracker"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.steamwise.tracker"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Core
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("androidx.activity:activity-compose:1.9.1")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Coil for Compose (Image / App icon loading)
    implementation("io.coil-kt:coil-compose:2.6.0")

    // Debugging & Testing
    debugImplementation("androidx.compose.ui:ui-tooling")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/data/local/GameEntity.kt',
    name: 'GameEntity.kt',
    category: 'room',
    description: 'Room Entity representing a tracked game with playtime seconds, last played timestamp, and metadata.',
    code: `package com.steamwise.tracker.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Represents a game/app tracked by SteamWise Tracker.
 * 
 * @property packageName Unique Android package name (e.g. "com.mojang.minecraftpe")
 * @property title Human-readable application label
 * @property iconUri Uri string or drawable resource identifier for the game icon
 * @property headerImageUri Optional Steam-style banner / screenshot URI
 * @property totalPlaytimeSeconds Accumulated foreground playtime in seconds
 * @property lastPlayedTimestamp Milliseconds epoch of when the game was last in foreground
 * @property isTracked Whether the user wants active background tracking enabled for this title
 * @property addedTimestamp When the game was added to the SteamWise library
 */
@Entity(tableName = "games")
data class GameEntity(
    @PrimaryKey
    val packageName: String,
    val title: String,
    val iconUri: String? = null,
    val headerImageUri: String? = null,
    val totalPlaytimeSeconds: Long = 0L,
    val lastPlayedTimestamp: Long = 0L,
    val isTracked: Boolean = true,
    val addedTimestamp: Long = System.currentTimeMillis()
) {
    /**
     * Formats total seconds into Steam-like display strings (e.g., "14h 20m" or "42m").
     */
    val formattedPlaytime: String
        get() {
            if (totalPlaytimeSeconds <= 0L) return "0m"
            val hours = totalPlaytimeSeconds / 3600
            val minutes = (totalPlaytimeSeconds % 3600) / 60
            return if (hours > 0) {
                if (minutes > 0) "\${hours}h \${minutes}m" else "\${hours}h"
            } else {
                "\${minutes}m"
            }
        }

    /**
     * Formats total seconds into decimal hours (e.g., "14.2 hrs on record").
     */
    val formattedDecimalHours: String
        get() {
            val hours = totalPlaytimeSeconds / 3600.0
            return String.format("%.1f hrs", hours)
        }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/data/local/GameDao.kt',
    name: 'GameDao.kt',
    category: 'room',
    description: 'Data Access Object for querying, updating playtime increments, and deleting tracked games.',
    code: `package com.steamwise.tracker.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface GameDao {

    @Query("SELECT * FROM games ORDER BY totalPlaytimeSeconds DESC")
    fun getAllTrackedGamesFlow(): Flow<List<GameEntity>>

    @Query("SELECT * FROM games WHERE isTracked = 1")
    suspend fun getActiveTrackedGames(): List<GameEntity>

    @Query("SELECT * FROM games WHERE packageName = :packageName LIMIT 1")
    suspend fun getGameByPackage(packageName: String): GameEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGame(game: GameEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGames(games: List<GameEntity>)

    @Update
    suspend fun updateGame(game: GameEntity)

    /**
     * Atomic increment of playtime in seconds and update of lastPlayedTimestamp.
     * Prevents race conditions during frequent background service polls.
     */
    @Query("""
        UPDATE games 
        SET totalPlaytimeSeconds = totalPlaytimeSeconds + :additionalSeconds,
            lastPlayedTimestamp = :timestamp
        WHERE packageName = :packageName
    """)
    suspend fun incrementPlaytime(
        packageName: String, 
        additionalSeconds: Long, 
        timestamp: Long = System.currentTimeMillis()
    )

    @Delete
    suspend fun deleteGame(game: GameEntity)

    @Query("DELETE FROM games WHERE packageName = :packageName")
    suspend fun deleteGameByPackage(packageName: String)

    @Query("SELECT SUM(totalPlaytimeSeconds) FROM games")
    fun getTotalPlaytimeAllGamesFlow(): Flow<Long?>
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/data/local/AppDatabase.kt',
    name: 'AppDatabase.kt',
    category: 'room',
    description: 'Thread-safe Room Database singleton provider with migrations support.',
    code: `package com.steamwise.tracker.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [GameEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun gameDao(): GameDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "steamwise_games.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/util/UsageStatsHelper.kt',
    name: 'UsageStatsHelper.kt',
    category: 'service',
    description: 'Handles PACKAGE_USAGE_STATS permission checks, Settings intent deep link, and foreground package detection.',
    code: `package com.steamwise.tracker.util

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings

object UsageStatsHelper {

    /**
     * Checks whether PACKAGE_USAGE_STATS permission is granted to this app.
     * Note: Normal checkCallingOrSelfPermission() does NOT work for PACKAGE_USAGE_STATS;
     * AppOpsManager must be used.
     */
    fun hasUsageStatsPermission(context: Context): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager 
            ?: return false
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    /**
     * Creates an Intent to navigate the user directly to the "Usage Access" settings screen.
     */
    fun createUsageAccessSettingsIntent(): Intent {
        return Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
    }

    /**
     * Identifies which application package is currently in the foreground.
     * Uses UsageEvents querying the recent window (e.g. past 10 seconds).
     */
    fun getForegroundPackageName(context: Context): String? {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return null

        val endTime = System.currentTimeMillis()
        val startTime = endTime - 10_000L // Query the last 10 seconds

        val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        var currentForegroundPackage: String? = null
        var lastEventTime: Long = 0L

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event)
            // ACTIVITY_RESUMED (1) indicates app brought to foreground
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                if (event.timeStamp >= lastEventTime) {
                    currentForegroundPackage = event.packageName
                    lastEventTime = event.timeStamp
                }
            }
        }

        // Fallback: If no RESUMED event in the 10s slice, query recent usage stats
        if (currentForegroundPackage == null) {
            val statsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime - 60_000L,
                endTime
            )
            val mostRecent = statsList?.maxByOrNull { it.lastTimeUsed }
            if (mostRecent != null && (endTime - mostRecent.lastTimeUsed) < 15_000L) {
                currentForegroundPackage = mostRecent.packageName
            }
        }

        return currentForegroundPackage
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/service/GamePlaytimeTrackerService.kt',
    name: 'GamePlaytimeTrackerService.kt',
    category: 'service',
    description: 'Foreground Service that periodically polls active foreground package and updates Room database playtime.',
    code: `package com.steamwise.tracker.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.steamwise.tracker.MainActivity
import com.steamwise.tracker.R
import com.steamwise.tracker.data.local.AppDatabase
import com.steamwise.tracker.util.UsageStatsHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Foreground Service responsible for continuous, battery-efficient game playtime tracking.
 * Polls active foreground app every [POLL_INTERVAL_MS] and increments database playtime.
 */
class GamePlaytimeTrackerService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private var trackingJob: Job? = null

    // Track state of current foreground game
    private var activeGamePackage: String? = null
    private var sessionSeconds: Long = 0L

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP_TRACKING -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                startForegroundServiceWithNotification()
                startTrackingLoop()
            }
        }
        return START_STICKY
    }

    private fun startForegroundServiceWithNotification() {
        val notification = buildTrackingNotification(
            title = "SteamWise Tracker Active",
            content = "Monitoring tracked game sessions in background..."
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(
                    NOTIFICATION_ID, 
                    notification, 
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun startTrackingLoop() {
        if (trackingJob?.isActive == true) return

        val database = AppDatabase.getInstance(applicationContext)
        val gameDao = database.gameDao()

        trackingJob = serviceScope.launch {
            while (isActive) {
                // Ensure permission is still held
                if (!UsageStatsHelper.hasUsageStatsPermission(applicationContext)) {
                    updateNotification("Permission required", "Grant Usage Access in Settings to resume tracking")
                    delay(5_000L)
                    continue
                }

                val currentForegroundPkg = UsageStatsHelper.getForegroundPackageName(applicationContext)

                if (currentForegroundPkg != null) {
                    val trackedGame = gameDao.getGameByPackage(currentForegroundPkg)

                    if (trackedGame != null && trackedGame.isTracked) {
                        // Increments playtime by poll duration in seconds
                        val incrementSeconds = (POLL_INTERVAL_MS / 1000L)
                        gameDao.incrementPlaytime(
                            packageName = trackedGame.packageName,
                            additionalSeconds = incrementSeconds
                        )

                        if (activeGamePackage == trackedGame.packageName) {
                            sessionSeconds += incrementSeconds
                        } else {
                            activeGamePackage = trackedGame.packageName
                            sessionSeconds = incrementSeconds
                        }

                        val sessionDisplay = if (sessionSeconds >= 60) {
                            "\${sessionSeconds / 60}m"
                        } else {
                            "\${sessionSeconds}s"
                        }

                        updateNotification(
                            title = "In-Game: \${trackedGame.title}",
                            content = "Playing for \$sessionDisplay • Total: \${trackedGame.formattedPlaytime}"
                        )
                    } else {
                        // User switched to a non-tracked app or home screen
                        if (activeGamePackage != null) {
                            activeGamePackage = null
                            sessionSeconds = 0L
                            updateNotification("SteamWise Tracker Idle", "Waiting for tracked game launch...")
                        }
                    }
                }

                delay(POLL_INTERVAL_MS)
            }
        }
    }

    private fun updateNotification(title: String, content: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildTrackingNotification(title, content))
    }

    private fun buildTrackingNotification(title: String, content: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent, 
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val stopIntent = Intent(this, GamePlaytimeTrackerService::class.java).apply {
            action = ACTION_STOP_TRACKING
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Tracking", stopPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SteamWise Playtime Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows real-time status of monitored games and playtime session"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        trackingJob?.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val CHANNEL_ID = "steamwise_tracker_channel"
        const val NOTIFICATION_ID = 4040
        const val POLL_INTERVAL_MS = 2_000L // Poll every 2 seconds for balance of accuracy & battery
        const val ACTION_START_TRACKING = "com.steamwise.tracker.START_TRACKING"
        const val ACTION_STOP_TRACKING = "com.steamwise.tracker.STOP_TRACKING"

        fun startService(context: Context) {
            val intent = Intent(context, GamePlaytimeTrackerService::class.java).apply {
                action = ACTION_START_TRACKING
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, GamePlaytimeTrackerService::class.java).apply {
                action = ACTION_STOP_TRACKING
            }
            context.startService(intent)
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/data/repository/GameRepository.kt',
    name: 'GameRepository.kt',
    category: 'viewmodel',
    description: 'Repository managing Room persistence and querying PackageManager for installed device apps.',
    code: `package com.steamwise.tracker.data.repository

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.steamwise.tracker.data.local.GameDao
import com.steamwise.tracker.data.local.GameEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

data class InstalledAppInfo(
    val packageName: String,
    val appName: String,
    val iconUri: String? = null,
    val isSystemApp: Boolean = false,
    val isAlreadyTracked: Boolean = false
)

class GameRepository(
    private val context: Context,
    private val gameDao: GameDao
) {
    val allGamesFlow: Flow<List<GameEntity>> = gameDao.getAllTrackedGamesFlow()
    val totalPlaytimeSecondsFlow: Flow<Long?> = gameDao.getTotalPlaytimeAllGamesFlow()

    suspend fun addGame(game: GameEntity) = withContext(Dispatchers.IO) {
        gameDao.insertGame(game)
    }

    suspend fun removeGame(packageName: String) = withContext(Dispatchers.IO) {
        gameDao.deleteGameByPackage(packageName)
    }

    suspend fun toggleTracking(game: GameEntity) = withContext(Dispatchers.IO) {
        gameDao.updateGame(game.copy(isTracked = !game.isTracked))
    }

    suspend fun getGame(packageName: String): GameEntity? = withContext(Dispatchers.IO) {
        gameDao.getGameByPackage(packageName)
    }

    /**
     * Queries the Android PackageManager for installed launcher applications.
     */
    suspend fun getInstalledLaunchableApps(): List<InstalledAppInfo> = withContext(Dispatchers.IO) {
        val packageManager = context.packageManager
        val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfos = packageManager.queryIntentActivities(mainIntent, 0)
        val currentlyTracked = gameDao.getActiveTrackedGames().map { it.packageName }.toSet()

        resolveInfos.mapNotNull { resolveInfo ->
            val pkg = resolveInfo.activityInfo.packageName
            // Exclude SteamWise itself from picker
            if (pkg == context.packageName) return@mapNotNull null

            val appName = resolveInfo.loadLabel(packageManager).toString()
            val isSystem = (resolveInfo.activityInfo.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0

            InstalledAppInfo(
                packageName = pkg,
                appName = appName,
                iconUri = "android.resource://\$pkg/\${resolveInfo.activityInfo.iconResource}",
                isSystemApp = isSystem,
                isAlreadyTracked = currentlyTracked.contains(pkg)
            )
        }.sortedBy { it.appName.lowercase() }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/ui/viewmodel/MainViewModel.kt',
    name: 'MainViewModel.kt',
    category: 'viewmodel',
    description: 'MVVM ViewModel exposing StateFlow for tracked games, installed apps sheet, sort filters, and permissions.',
    code: `package com.steamwise.tracker.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.steamwise.tracker.data.local.AppDatabase
import com.steamwise.tracker.data.local.GameEntity
import com.steamwise.tracker.data.repository.GameRepository
import com.steamwise.tracker.data.repository.InstalledAppInfo
import com.steamwise.tracker.service.GamePlaytimeTrackerService
import com.steamwise.tracker.util.UsageStatsHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class SortMode {
    PLAYTIME_DESC,
    PLAYTIME_ASC,
    RECENTLY_PLAYED,
    ALPHABETICAL
}

data class MainUiState(
    val games: List<GameEntity> = emptyList(),
    val totalPlaytimeSeconds: Long = 0L,
    val installedApps: List<InstalledAppInfo> = emptyList(),
    val isAppPickerOpen: Boolean = false,
    val searchQuery: String = "",
    val sortMode: SortMode = SortMode.PLAYTIME_DESC,
    val hasUsageStatsPermission: Boolean = false,
    val isServiceRunning: Boolean = false,
    val isLoadingApps: Boolean = false
)

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: GameRepository
    private val _searchQuery = MutableStateFlow("")
    private val _sortMode = MutableStateFlow(SortMode.PLAYTIME_DESC)
    private val _isAppPickerOpen = MutableStateFlow(false)
    private val _installedApps = MutableStateFlow<List<InstalledAppInfo>>(emptyList())
    private val _hasPermission = MutableStateFlow(false)
    private val _isServiceRunning = MutableStateFlow(false)
    private val _isLoadingApps = MutableStateFlow(false)

    init {
        val database = AppDatabase.getInstance(application)
        repository = GameRepository(application, database.gameDao())
        checkPermission()
    }

    val uiState: StateFlow<MainUiState> = combine(
        repository.allGamesFlow,
        repository.totalPlaytimeSecondsFlow,
        _searchQuery,
        _sortMode,
        _isAppPickerOpen,
        _installedApps,
        _hasPermission,
        _isServiceRunning
    ) { params ->
        @Suppress("UNCHECKED_CAST")
        val allGames = params[0] as List<GameEntity>
        val totalSec = (params[1] as? Long) ?: 0L
        val query = params[2] as String
        val sort = params[3] as SortMode
        val isPickerOpen = params[4] as Boolean
        val apps = params[5] as List<InstalledAppInfo>
        val hasPerm = params[6] as Boolean
        val serviceRunning = params[7] as Boolean

        // Filter by search query
        val filtered = if (query.isBlank()) {
            allGames
        } else {
            allGames.filter { it.title.contains(query, ignoreCase = true) || it.packageName.contains(query, ignoreCase = true) }
        }

        // Sort games
        val sorted = when (sort) {
            SortMode.PLAYTIME_DESC -> filtered.sortedByDescending { it.totalPlaytimeSeconds }
            SortMode.PLAYTIME_ASC -> filtered.sortedBy { it.totalPlaytimeSeconds }
            SortMode.RECENTLY_PLAYED -> filtered.sortedByDescending { it.lastPlayedTimestamp }
            SortMode.ALPHABETICAL -> filtered.sortedBy { it.title.lowercase() }
        }

        MainUiState(
            games = sorted,
            totalPlaytimeSeconds = totalSec,
            installedApps = apps,
            isAppPickerOpen = isPickerOpen,
            searchQuery = query,
            sortMode = sort,
            hasUsageStatsPermission = hasPerm,
            isServiceRunning = serviceRunning
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = MainUiState()
    )

    fun checkPermission() {
        val hasPerm = UsageStatsHelper.hasUsageStatsPermission(getApplication())
        _hasPermission.value = hasPerm
    }

    fun openAppPicker() {
        _isAppPickerOpen.value = true
        loadInstalledApps()
    }

    fun closeAppPicker() {
        _isAppPickerOpen.value = false
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setSortMode(mode: SortMode) {
        _sortMode.value = mode
    }

    private fun loadInstalledApps() {
        viewModelScope.launch {
            _isLoadingApps.value = true
            _installedApps.value = repository.getInstalledLaunchableApps()
            _isLoadingApps.value = false
        }
    }

    fun addGameToTracking(appInfo: InstalledAppInfo) {
        viewModelScope.launch {
            val newGame = GameEntity(
                packageName = appInfo.packageName,
                title = appInfo.appName,
                iconUri = appInfo.iconUri,
                isTracked = true
            )
            repository.addGame(newGame)
            // Reload installed apps to update tracked checkmarks
            loadInstalledApps()
            
            // Auto start tracking service if permission granted
            if (_hasPermission.value) {
                startTrackingService()
            }
        }
    }

    fun removeGame(packageName: String) {
        viewModelScope.launch {
            repository.removeGame(packageName)
        }
    }

    fun startTrackingService() {
        GamePlaytimeTrackerService.startService(getApplication())
        _isServiceRunning.value = true
    }

    fun stopTrackingService() {
        GamePlaytimeTrackerService.stopService(getApplication())
        _isServiceRunning.value = false
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/ui/theme/Theme.kt',
    name: 'Theme.kt',
    category: 'compose',
    description: 'Jetpack Compose Material 3 Theme with authentic Steam Dark Mode palette and typography.',
    code: `package com.steamwise.tracker.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Steam Palette Colors
val SteamDarkBg = Color(0xFF0E141B)        // Deepest charcoal background
val SteamCardBg = Color(0xFF171D25)        // Steam client panel dark gray
val SteamCardHover = Color(0xFF222C38)     // Slightly elevated card background
val SteamSurfaceVariant = Color(0xFF1B2838)// Steam signature navy blue-gray
val SteamBlue = Color(0xFF1A9FFF)          // Primary electric blue accent
val SteamBlueHover = Color(0xFF66C0F4)     // Bright sky blue highlight
val SteamGreen = Color(0xFF5C7E10)         // Steam library Play button green
val SteamGreenAccent = Color(0xFFA4D007)   // Vibrant lime green in-game indicator
val SteamTextPrimary = Color(0xFFFFFFFF)   // Crisp high-contrast white
val SteamTextSecondary = Color(0xFFC7D5E0) // Steam muted blue-gray text
val SteamTextMuted = Color(0xFF8F98A0)     // Low contrast secondary text
val SteamBadgeGold = Color(0xFFFFD700)     // Master achievement gold

private val SteamDarkColorScheme = darkColorScheme(
    primary = SteamBlue,
    onPrimary = Color.White,
    primaryContainer = SteamSurfaceVariant,
    onPrimaryContainer = SteamBlueHover,
    secondary = SteamGreenAccent,
    onSecondary = Color.Black,
    secondaryContainer = SteamGreen,
    onSecondaryContainer = Color.White,
    background = SteamDarkBg,
    onBackground = SteamTextPrimary,
    surface = SteamCardBg,
    onSurface = SteamTextPrimary,
    surfaceVariant = SteamSurfaceVariant,
    onSurfaceVariant = SteamTextSecondary,
    outline = Color(0xFF2A475E)
)

@Composable
fun SteamWiseTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = SteamDarkColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = SteamDarkBg.toArgb()
            window.navigationBarColor = SteamDarkBg.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/ui/screens/MainLibraryScreen.kt',
    name: 'MainLibraryScreen.kt',
    category: 'compose',
    description: 'Main Steam-styled game library screen with playtime statistics, filter dropdowns, and cards.',
    code: `package com.steamwise.tracker.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.steamwise.tracker.data.local.GameEntity
import com.steamwise.tracker.ui.theme.*
import com.steamwise.tracker.ui.viewmodel.MainUiState
import com.steamwise.tracker.ui.viewmodel.MainViewModel
import com.steamwise.tracker.ui.viewmodel.SortMode
import com.steamwise.tracker.util.UsageStatsHelper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainLibraryScreen(
    viewModel: MainViewModel,
    uiState: MainUiState,
    onOpenSettings: () -> Unit
) {
    val context = LocalContext.current
    var showSortMenu by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = SteamDarkBg,
        topBar = {
            SteamTopAppBar(
                totalPlaytimeSeconds = uiState.totalPlaytimeSeconds,
                totalGamesCount = uiState.games.size,
                isServiceRunning = uiState.isServiceRunning,
                onToggleService = {
                    if (uiState.isServiceRunning) viewModel.stopTrackingService()
                    else viewModel.startTrackingService()
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.openAppPicker() },
                containerColor = SteamBlue,
                contentColor = Color.White,
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Game")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Add Game", fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Permission Notice Banner if PACKAGE_USAGE_STATS is missing
            if (!uiState.hasUsageStatsPermission) {
                PermissionWarningCard(onOpenSettings = onOpenSettings)
            }

            // Search Bar & Filter Header
            SearchBarAndFilters(
                searchQuery = uiState.searchQuery,
                onSearchChange = { viewModel.setSearchQuery(it) },
                currentSort = uiState.sortMode,
                onSortClick = { showSortMenu = true }
            )

            // Sort Dropdown Menu
            DropdownMenu(
                expanded = showSortMenu,
                onDismissRequest = { showSortMenu = false },
                modifier = Modifier.background(SteamCardBg)
            ) {
                DropdownMenuItem(
                    text = { Text("Most Played (Hours)", color = SteamTextPrimary) },
                    onClick = {
                        viewModel.setSortMode(SortMode.PLAYTIME_DESC)
                        showSortMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("Recently Played", color = SteamTextPrimary) },
                    onClick = {
                        viewModel.setSortMode(SortMode.RECENTLY_PLAYED)
                        showSortMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("Alphabetical (A-Z)", color = SteamTextPrimary) },
                    onClick = {
                        viewModel.setSortMode(SortMode.ALPHABETICAL)
                        showSortMenu = false
                    }
                )
            }

            // Games Grid / Empty State
            if (uiState.games.isEmpty()) {
                EmptyLibraryView(onAddGameClick = { viewModel.openAppPicker() })
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 165.dp),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.games, key = { it.packageName }) { game ->
                        SteamGameCard(
                            game = game,
                            onLaunchGame = {
                                val launchIntent = context.packageManager.getLaunchIntentForPackage(game.packageName)
                                if (launchIntent != null) {
                                    context.startActivity(launchIntent)
                                }
                            },
                            onRemoveGame = { viewModel.removeGame(game.packageName) }
                        )
                    }
                }
            }
        }

        // App Picker Bottom Sheet
        if (uiState.isAppPickerOpen) {
            AppPickerDialog(
                installedApps = uiState.installedApps,
                onDismiss = { viewModel.closeAppPicker() },
                onAddGame = { appInfo -> viewModel.addGameToTracking(appInfo) }
            )
        }
    }
}

@Composable
fun SteamGameCard(
    game: GameEntity,
    onLaunchGame: () -> Unit,
    onRemoveGame: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, Color(0xFF2A475E).copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .clickable { onLaunchGame() },
        colors = CardDefaults.cardColors(containerColor = SteamCardBg)
    ) {
        Column {
            // Artwork / Header Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(95.dp)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFF1B2838), Color(0xFF101822))
                        )
                    )
            ) {
                // Game Icon / Thumbnail
                if (!game.iconUri.isNullOrBlank()) {
                    AsyncImage(
                        model = game.iconUri,
                        contentDescription = game.title,
                        modifier = Modifier
                            .size(52.dp)
                            .align(Alignment.Center)
                            .clip(RoundedCornerShape(10.dp)),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Icon(
                        Icons.Default.SportsEsports,
                        contentDescription = null,
                        modifier = Modifier
                            .size(44.dp)
                            .align(Alignment.Center),
                        tint = SteamBlueHover
                    )
                }

                // Options Button
                IconButton(
                    onClick = { showMenu = true },
                    modifier = Modifier.align(Alignment.TopEnd)
                ) {
                    Icon(
                        Icons.Default.MoreVert,
                        contentDescription = "Options",
                        tint = SteamTextMuted
                    )
                }

                DropdownMenu(
                    expanded = showMenu,
                    onDismissRequest = { showMenu = false },
                    modifier = Modifier.background(SteamCardBg)
                ) {
                    DropdownMenuItem(
                        text = { Text("Launch Game", color = SteamTextPrimary) },
                        leadingIcon = { Icon(Icons.Default.PlayArrow, null, tint = SteamGreenAccent) },
                        onClick = {
                            showMenu = false
                            onLaunchGame()
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Remove from Library", color = Color(0xFFFF6B6B)) },
                        leadingIcon = { Icon(Icons.Default.Delete, null, tint = Color(0xFFFF6B6B)) },
                        onClick = {
                            showMenu = false
                            onRemoveGame()
                        }
                    )
                }
            }

            // Card Body (Steam Style Information)
            Column(
                modifier = Modifier
                    .padding(10.dp)
                    .fillMaxWidth()
            ) {
                Text(
                    text = game.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = SteamTextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Playtime badge
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        Icons.Default.Schedule,
                        contentDescription = null,
                        modifier = Modifier.size(12.dp),
                        tint = SteamBlueHover
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = game.formattedDecimalHours + " on record",
                        fontSize = 11.sp,
                        color = SteamTextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Steam Quick Play Button
                Button(
                    onClick = onLaunchGame,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = SteamGreen,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(4.dp),
                    contentPadding = PaddingValues(vertical = 4.dp, horizontal = 10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(28.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.PlayArrow,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("PLAY", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun SteamTopAppBar(
    totalPlaytimeSeconds: Long,
    totalGamesCount: Int,
    isServiceRunning: Boolean,
    onToggleService: () -> Unit
) {
    Surface(
        color = SteamSurfaceVariant,
        tonalElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(SteamBlue),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.SportsEsports,
                            contentDescription = "Logo",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            "STEAMWISE",
                            color = SteamTextPrimary,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.2.sp,
                            fontSize = 18.sp
                        )
                        Text(
                            "Game Playtime Tracker",
                            color = SteamTextMuted,
                            fontSize = 11.sp
                        )
                    }
                }

                // Service Status Toggle Pill
                FilterChip(
                    selected = isServiceRunning,
                    onClick = onToggleService,
                    label = {
                        Text(
                            if (isServiceRunning) "TRACKING ACTIVE" else "PAUSED",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    leadingIcon = {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (isServiceRunning) SteamGreenAccent else Color.Gray)
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF1B4021),
                        selectedLabelColor = SteamGreenAccent,
                        containerColor = SteamCardBg,
                        labelColor = SteamTextMuted
                    )
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Stats Quick Summary Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SteamCardBg, RoundedCornerShape(6.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                StatItem(label = "TRACKED GAMES", value = "\$totalGamesCount")
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(28.dp)
                        .background(Color(0xFF2A475E))
                )
                val totalHours = String.format("%.1f", totalPlaytimeSeconds / 3600.0)
                StatItem(label = "TOTAL PLAYTIME", value = "\$totalHours hrs")
            }
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = SteamBlueHover, fontWeight = FontWeight.Bold, fontSize = 15.sp)
        Text(label, color = SteamTextMuted, fontSize = 9.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun PermissionWarningCard(onOpenSettings: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF332014)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF9800))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFFF9800))
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "Usage Access Required",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
                Text(
                    "Grant Android Usage Access to enable foreground game detection.",
                    color = Color(0xFFFFCC80),
                    fontSize = 11.sp
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = onOpenSettings,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text("Grant", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        }
    }
}

@Composable
fun SearchBarAndFilters(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    currentSort: SortMode,
    onSortClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            placeholder = { Text("Filter your library...", color = SteamTextMuted, fontSize = 13.sp) },
            leadingIcon = { Icon(Icons.Default.Search, null, tint = SteamTextMuted) },
            modifier = Modifier
                .weight(1f)
                .height(48.dp),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = SteamCardBg,
                unfocusedContainerColor = SteamCardBg,
                focusedBorderColor = SteamBlue,
                unfocusedBorderColor = Color(0xFF2A475E),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(6.dp)
        )

        Spacer(modifier = Modifier.width(8.dp))

        IconButton(
            onClick = onSortClick,
            modifier = Modifier
                .size(48.dp)
                .background(SteamCardBg, RoundedCornerShape(6.dp))
                .border(1.dp, Color(0xFF2A475E), RoundedCornerShape(6.dp))
        ) {
            Icon(Icons.Default.Sort, contentDescription = "Sort", tint = SteamBlueHover)
        }
    }
}

@Composable
fun EmptyLibraryView(onAddGameClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.SportsEsports,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = SteamTextMuted.copy(alpha = 0.5f)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Your SteamWise Library is Empty",
            color = SteamTextPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Add installed games from your device to automatically track session hours and stats.",
            color = SteamTextMuted,
            fontSize = 12.sp,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Spacer(modifier = Modifier.height(20.dp))
        Button(
            onClick = onAddGameClick,
            colors = ButtonDefaults.buttonColors(containerColor = SteamBlue),
            shape = RoundedCornerShape(6.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(6.dp))
            Text("Select Installed Games")
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/ui/screens/AppPickerDialog.kt',
    name: 'AppPickerDialog.kt',
    category: 'compose',
    description: 'ModalBottomSheet listing all installed device applications with instant search and toggle.',
    code: `package com.steamwise.tracker.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.steamwise.tracker.data.repository.InstalledAppInfo
import com.steamwise.tracker.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppPickerDialog(
    installedApps: List<InstalledAppInfo>,
    onDismiss: () -> Unit,
    onAddGame: (InstalledAppInfo) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }

    val filteredApps = remember(installedApps, searchQuery) {
        if (searchQuery.isBlank()) installedApps
        else installedApps.filter {
            it.appName.contains(searchQuery, ignoreCase = true) ||
            it.packageName.contains(searchQuery, ignoreCase = true)
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SteamCardBg,
        scrimColor = Color.Black.copy(alpha = 0.65f),
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
                .padding(horizontal = 16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "Add Game to Library",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = SteamTextPrimary
                    )
                    Text(
                        "Choose any installed app to start tracking playtime",
                        fontSize = 12.sp,
                        color = SteamTextMuted
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = SteamTextMuted)
                }
            }

            // Search filter
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search installed applications...", color = SteamTextMuted, fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, null, tint = SteamTextMuted) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = SteamDarkBg,
                    unfocusedContainerColor = SteamDarkBg,
                    focusedBorderColor = SteamBlue,
                    unfocusedBorderColor = Color(0xFF2A475E),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(8.dp)
            )

            // Installed apps list
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredApps, key = { it.packageName }) { appInfo ->
                    InstalledAppRow(
                        appInfo = appInfo,
                        onAdd = { onAddGame(appInfo) }
                    )
                }
            }
        }
    }
}

@Composable
fun InstalledAppRow(
    appInfo: InstalledAppInfo,
    onAdd: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable(enabled = !appInfo.isAlreadyTracked) { onAdd() },
        color = SteamSurfaceVariant.copy(alpha = 0.6f)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // App Icon
            if (!appInfo.iconUri.isNullOrBlank()) {
                AsyncImage(
                    model = appInfo.iconUri,
                    contentDescription = appInfo.appName,
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(SteamCardBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.SportsEsports, null, tint = SteamBlueHover)
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    appInfo.appName,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                    color = SteamTextPrimary
                )
                Text(
                    appInfo.packageName,
                    fontSize = 11.sp,
                    color = SteamTextMuted
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            if (appInfo.isAlreadyTracked) {
                AssistChip(
                    onClick = { /* already tracked */ },
                    label = { Text("Tracked", fontSize = 11.sp, color = SteamGreenAccent) },
                    leadingIcon = {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            tint = SteamGreenAccent,
                            modifier = Modifier.size(14.dp)
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = Color(0xFF1B4021).copy(alpha = 0.5f)
                    ),
                    border = null
                )
            } else {
                Button(
                    onClick = onAdd,
                    colors = ButtonDefaults.buttonColors(containerColor = SteamBlue),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("+ Track", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'activity',
    description: 'Main Activity launching Compose UI, monitoring lifecycle, and handling Usage Access flow.',
    code: `package com.steamwise.tracker

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.steamwise.tracker.ui.screens.MainLibraryScreen
import com.steamwise.tracker.ui.theme.SteamWiseTheme
import com.steamwise.tracker.ui.viewmodel.MainViewModel
import com.steamwise.tracker.util.UsageStatsHelper

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            SteamWiseTheme {
                val uiState by viewModel.uiState.collectAsState()

                MainLibraryScreen(
                    viewModel = viewModel,
                    uiState = uiState,
                    onOpenSettings = {
                        startActivity(UsageStatsHelper.createUsageAccessSettingsIntent())
                    }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Re-check permission in case user just returned from Android Settings
        viewModel.checkPermission()
    }
}`,
  },
  {
    path: 'app/src/main/java/com/steamwise/tracker/SteamWiseApplication.kt',
    name: 'SteamWiseApplication.kt',
    category: 'activity',
    description: 'Application class initializing Room Database and notification channels.',
    code: `package com.steamwise.tracker

import android.app.Application
import com.steamwise.tracker.data.local.AppDatabase

class SteamWiseApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Pre-warm Room database instance
        AppDatabase.getInstance(this)
    }
}`,
  },
  {
    path: 'capacitor.config.ts',
    name: 'capacitor.config.ts',
    category: 'capacitor',
    description: 'Capacitor root configuration setting appId, appName, and webDir to dist.',
    code: `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.steamwise.tracker',
  appName: 'SteamWise Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;`,
  },
  {
    path: 'android/build.gradle',
    name: 'android/build.gradle',
    category: 'capacitor',
    description: 'Root Gradle build script for Capacitor Android project.',
    code: `// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.13.0'
        classpath 'com.google.gms:google-services:4.4.4'
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`,
  },
  {
    path: 'android/settings.gradle',
    name: 'android/settings.gradle',
    category: 'capacitor',
    description: 'Capacitor Android settings.gradle linking the app module and plugins.',
    code: `include ':app'
include ':capacitor-cordova-android-plugins'
project(':capacitor-cordova-android-plugins').projectDir = new File('./capacitor-cordova-android-plugins/')

apply from: 'capacitor.settings.gradle'`,
  },
  {
    path: 'android/app/build.gradle',
    name: 'android/app/build.gradle',
    category: 'capacitor',
    description: 'Capacitor app module Gradle build configuration.',
    code: `apply plugin: 'com.android.application'

android {
    namespace = "com.steamwise.tracker"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.steamwise.tracker"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'`,
  },
];
