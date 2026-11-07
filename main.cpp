
#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>
#include <limits>
using namespace std;

// -------------------- PROCESS DEFINITIONS --------------------

enum State { NEW, READY, RUNNING, BLOCKED, COMPLETED };

struct Process {
    string name;
    int basePriority = 0, effectivePriority = 0;
    int arrivalTime = 0, burstTime = 0, remainingTime = 0;
    int criticalSectionDuration = 0, criticalSectionRemaining = 0;
    bool criticalSectionStarted = false, hasResource = false;
    State state = NEW;
    int blockedSince = -1, totalBlockedTime = 0, completionTime = -1;
};

struct GanttSegment {
    string name;
    int start, end;
};

// -------------------- SIMULATOR CLASS --------------------

class Simulator {
private:
    vector<Process> processes;
    vector<int> waitingQueue;
    vector<GanttSegment> ganttChart;
    vector<string> eventLog;

    bool priorityInheritance;
    int resourceOwner = -1, currentTime = 0, completedCount = 0;

    void logEvent(const string& message) {
        eventLog.push_back("Time " + to_string(currentTime) + ": " + message);
    }

    void addArrivals() {
        for (auto& p : processes) {
            if (p.state == NEW && p.arrivalTime <= currentTime) {
                p.state = READY;
                logEvent(p.name + " arrives with priority " +
                         to_string(p.basePriority));
            }
        }
    }

    int selectHighestPriorityProcess() {
        int selected = -1;

        for (int i = 0; i < (int)processes.size(); i++) {
            if (processes[i].state == READY &&
                (selected == -1 ||
                 processes[i].effectivePriority >
                 processes[selected].effectivePriority)) {
                selected = i;
            }
        }
        return selected;
    }

    void updatePriorityInheritance(int owner) {
        if (!priorityInheritance || owner == -1) return;

        int highest = processes[owner].basePriority;

        for (int i : waitingQueue)
            highest = max(highest, processes[i].effectivePriority);

        Process& p = processes[owner];

        if (p.effectivePriority != highest) {
            p.effectivePriority = highest;
            logEvent(p.name + " inherits priority " + to_string(highest));
        }
    }

    bool requestResource(int index) {
        Process& p = processes[index];

        if (p.criticalSectionDuration == 0 || p.criticalSectionStarted)
            return true;

        if (resourceOwner == -1) {
            resourceOwner = index;
            p.hasResource = true;
            p.criticalSectionStarted = true;
            logEvent(p.name + " locks shared resource R");
            return true;
        }

        p.state = BLOCKED;
        p.blockedSince = currentTime;
        waitingQueue.push_back(index);

        logEvent(p.name + " is BLOCKED waiting for resource R");
        updatePriorityInheritance(resourceOwner);

        return false;
    }

    void releaseResource(int owner, int releaseTime) {
        if (resourceOwner != owner) return;

        Process& p = processes[owner];

        logEvent(p.name + " releases shared resource R");
        p.hasResource = false;

        if (p.effectivePriority != p.basePriority) {
            p.effectivePriority = p.basePriority;
            logEvent(p.name + " restores original priority " +
                     to_string(p.basePriority));
        }

        resourceOwner = -1;

        if (waitingQueue.empty()) return;

        int best = 0;

        for (int i = 1; i < (int)waitingQueue.size(); i++) {
            if (processes[waitingQueue[i]].effectivePriority >
                processes[waitingQueue[best]].effectivePriority)
                best = i;
        }

        int nextOwner = waitingQueue[best];
        waitingQueue.erase(waitingQueue.begin() + best);

        Process& next = processes[nextOwner];

        next.totalBlockedTime += releaseTime - next.blockedSince;
        next.blockedSince = -1;
        next.state = READY;
        next.hasResource = true;
        next.criticalSectionStarted = true;

        resourceOwner = nextOwner;

        logEvent(next.name + " becomes READY and receives resource R");
        updatePriorityInheritance(nextOwner);
    }

    void addGanttSegment(const string& name) {
        if (!ganttChart.empty() &&
            ganttChart.back().name == name &&
            ganttChart.back().end == currentTime) {
            ganttChart.back().end++;
        } else {
            ganttChart.push_back({name, currentTime, currentTime + 1});
        }
    }

public:
    Simulator(const vector<Process>& input, bool usePI)
        : processes(input), priorityInheritance(usePI) {

        for (auto& p : processes) {
            p.effectivePriority = p.basePriority;
            p.remainingTime = p.burstTime;
            p.criticalSectionRemaining = p.criticalSectionDuration;
            p.criticalSectionStarted = false;
            p.hasResource = false;
            p.state = NEW;
            p.blockedSince = -1;
            p.totalBlockedTime = 0;
            p.completionTime = -1;
        }
    }

    // -------------------- EXECUTION --------------------

    void run() {
        while (completedCount < (int)processes.size()) {
            addArrivals();

            int selected = selectHighestPriorityProcess();

            if (selected == -1) {
                addGanttSegment("IDLE");
                logEvent("CPU is IDLE");
                currentTime++;
                continue;
            }

            if (!requestResource(selected)) continue;

            Process& p = processes[selected];
            p.state = RUNNING;

            logEvent(p.name + " executes with effective priority " +
                     to_string(p.effectivePriority));

            addGanttSegment(p.name);
            p.remainingTime--;

            if (p.hasResource && p.criticalSectionRemaining > 0) {
                p.criticalSectionRemaining--;

                if (p.criticalSectionRemaining == 0)
                    releaseResource(selected, currentTime + 1);
            }

            if (p.remainingTime == 0) {
                p.state = COMPLETED;
                p.completionTime = currentTime + 1;
                completedCount++;
                logEvent(p.name + " COMPLETED");
            } else {
                p.state = READY;
            }

            currentTime++;
        }
    }

    // -------------------- OUTPUT FUNCTIONS --------------------

    void displayGanttChart() const {
        cout << "\n----------- GANTT CHART -----------\n\n";

        for (const auto& s : ganttChart)
            cout << "| " << s.name << " [" << s.start
                 << "-" << s.end << "] ";

        cout << "|\n";
    }

    void displayEventLog() const {
        cout << "\n----------- EVENT LOG -----------\n\n";

        for (const auto& event : eventLog)
            cout << event << "\n";
    }

    void displayProcessDetails() const {
        cout << "\n----------- PROCESS DETAILS -----------\n\n";

        cout << left
             << setw(10) << "Process"
             << setw(12) << "Base Pri"
             << setw(12) << "Arrival"
             << setw(12) << "Burst"
             << setw(12) << "CS Time"
             << setw(12) << "Blocked"
             << setw(12) << "Completion" << "\n";

        cout << string(82, '-') << "\n";

        for (const auto& p : processes) {
            cout << left
                 << setw(10) << p.name
                 << setw(12) << p.basePriority
                 << setw(12) << p.arrivalTime
                 << setw(12) << p.burstTime
                 << setw(12) << p.criticalSectionDuration
                 << setw(12) << p.totalBlockedTime
                 << setw(12) << p.completionTime << "\n";
        }
    }

    int getBlockingTime(const string& name) const {
        for (const auto& p : processes)
            if (p.name == name) return p.totalBlockedTime;

        return 0;
    }

    int getTotalSimulationTime() const {
        int total = 0;

        for (const auto& p : processes)
            total = max(total, p.completionTime);

        return total;
    }
};

// -------------------- INPUT FUNCTIONS --------------------

int readInteger(const string& message, int minimum, int maximum) {
    int value;

    while (true) {
        cout << message;

        if (cin >> value && value >= minimum && value <= maximum)
            return value;

        cout << "Invalid input! Enter a value between "
             << minimum << " and " << maximum << ".\n";

        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

Process readProcess(const string& name, int priority) {
    Process p;
    p.name = name;
    p.basePriority = priority;
    p.effectivePriority = priority;

    cout << "\nEnter details for Process " << name << ":\n";

    p.arrivalTime = readInteger("Arrival time: ", 0, 10000);
    p.burstTime = readInteger("CPU burst time: ", 1, 10000);

    p.criticalSectionDuration = readInteger(
        "Critical section duration (0 if no resource): ",
        0, p.burstTime
    );

    return p;
}

vector<Process> readProcesses() {
    int L, M, H;

    while (true) {
        cout << "\nEnter process priorities:\n";

        L = readInteger("Low Priority Process L: ", 1, 1000);
        M = readInteger("Medium Priority Process M: ", 1, 1000);
        H = readInteger("High Priority Process H: ", 1, 1000);

        if (L < M && M < H) break;

        cout << "\nInvalid priorities! Required order: L < M < H.\n";
    }

    return {
        readProcess("L", L),
        readProcess("M", M),
        readProcess("H", H)
    };
}

// -------------------- MAIN FUNCTION --------------------

int main() {
    cout << "\n============================================\n"
         << " PRIORITY INVERSION AND PRIORITY INHERITANCE\n"
         << "       REAL-TIME OS SCHEDULING SIMULATOR\n"
         << "============================================\n";

    cout << "\nIMPORTANT:\n"
         << "Higher priority number = Higher priority.\n"
         << "Enter priorities in the order L < M < H.\n"
         << "Enter 0 for critical section if a process\n"
         << "does not use the shared resource R.\n";

    vector<Process> processes = readProcesses();

    cout << "\n============================================\n"
         << "       USER INPUT CONFIGURATION\n"
         << "============================================\n";

    for (const auto& p : processes) {
        cout << "\nProcess: " << p.name
             << "\nPriority: " << p.basePriority
             << "\nArrival time: " << p.arrivalTime
             << "\nCPU burst: " << p.burstTime
             << "\nCritical section: " << p.criticalSectionDuration
             << "\n";
    }

    // Simulation without Priority Inheritance
    cout << "\n========================================\n"
         << " SIMULATION WITHOUT PRIORITY INHERITANCE\n"
         << "========================================\n";

    Simulator withoutPI(processes, false);
    withoutPI.run();

    withoutPI.displayGanttChart();
    withoutPI.displayEventLog();
    withoutPI.displayProcessDetails();

    int blockingWithout = withoutPI.getBlockingTime("H");
    int totalWithout = withoutPI.getTotalSimulationTime();

    // Simulation with Priority Inheritance
    cout << "\n========================================\n"
         << " SIMULATION WITH PRIORITY INHERITANCE\n"
         << "========================================\n";

    Simulator withPI(processes, true);
    withPI.run();

    withPI.displayGanttChart();
    withPI.displayEventLog();
    withPI.displayProcessDetails();

    int blockingWith = withPI.getBlockingTime("H");
    int totalWith = withPI.getTotalSimulationTime();

    // Performance comparison
    cout << "\n============================================\n"
         << "         PERFORMANCE COMPARISON\n"
         << "============================================\n\n";

    cout << left
         << setw(32) << "Metric"
         << setw(18) << "Without PI"
         << setw(18) << "With PI" << "\n";

    cout << string(68, '-') << "\n";

    cout << left
         << setw(32) << "H Blocking Time"
         << setw(18) << blockingWithout
         << setw(18) << blockingWith << "\n";

    cout << left
         << setw(32) << "Total Simulation Time"
         << setw(18) << totalWithout
         << setw(18) << totalWith << "\n";

    cout << string(68, '-') << "\n";

    if (blockingWithout > 0) {
        double reduction =
            (double)(blockingWithout - blockingWith)
            / blockingWithout * 100.0;

        cout << fixed << setprecision(2)
             << "\nBlocking Time Reduction: "
             << reduction << "%\n";
    } else {
        cout << "\nH did not experience blocking without PI.\n"
             << "Percentage reduction is not applicable.\n";
    }

    cout << "\n============================================\n"
         << "           SIMULATION COMPLETED\n"
         << "============================================\n";

    return 0;
}
